const express = require('express');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const shopifyAuth = require('../shopify/shopifyAuth');
const userDashboard = require('../shopify/userDashboard');
const adminDashboard = require('../shopify/adminDashboard');
const OpenAI = require('openai');

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// 🔐 Auth middleware
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    if (!req.user) {
      throw new Error('User not found');
    }
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// 🎯 Subscription prompt limits
const SUBSCRIPTION_LIMITS = {
  free: 5,
  personal: 200,
  professional: 750,
  business: 3500
};

// 🧠 OpenAI instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🤖 Chat endpoint
app.post("/api/chat", authenticateUser, async (req, res) => {
  try {
    const { message } = req.body;
    const promptLimit = SUBSCRIPTION_LIMITS[req.user.subscriptionType] || 5;

    if (req.user.promptsUsed >= promptLimit) {
      return res.status(403).json({ error: "Monthly prompt limit reached" });
    }

    // 🧠 Main assistant response
    const mainResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that provides advice on marketing, branding, business ideas, and social media. Be concise, strategic, and encouraging."
        },
        { role: "user", content: message }
      ],
      max_tokens: 300
    });

    // 🧠 Follow-up questions generation
    const followUpResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI that generates 2 short follow-up questions based on a user's marketing-related input. Return only the questions in a numbered list format."
        },
        { role: "user", content: message }
      ],
      max_tokens: 100
    });

    const responseText = mainResponse.choices[0].message.content.trim();
    const followUps = followUpResponse.choices[0].message.content.trim();

    // ✅ Update prompt usage
    await prisma.user.update({
      where: { id: req.user.id },
      data: { promptsUsed: { increment: 1 } }
    });

    // 📨 Respond
    res.json({
      response: `${responseText}\n\nFollow-up questions:\n${followUps}`
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Shopify routes
app.use('/shopify', shopifyAuth);
app.use('/shopify', userDashboard);
app.use('/shopify', adminDashboard);

// Handle 404 for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

module.exports = app;
