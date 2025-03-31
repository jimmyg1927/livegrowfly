const express = require("express");
const dotenv = require("dotenv");
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const shopifyAuth = require('../shopify/shopifyAuth.js');
const userDashboard = require('../shopify/userDashboard.js');
const adminDashboard = require('../shopify/adminDashboard.js');
const OpenAI = require("openai");

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
    if (!req.user) throw new Error('User not found');
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
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 📥 Embedded app entry from Shopify Admin
app.get("/", (req, res) => {
  const { shop } = req.query;

  if (!shop || !shop.endsWith(".myshopify.com")) {
    console.log("⚠️ Missing ?shop param");
    return res.status(400).send("Missing or invalid ?shop= parameter");
  }

  return res.redirect(`/shopify/auth?shop=${shop}`);
});

// 🤖 Chat endpoint
app.post("/api/chat", authenticateUser, async (req, res) => {
  try {
    const { message } = req.body;
    const promptLimit = SUBSCRIPTION_LIMITS[req.user.subscriptionType] || 5;

    if (req.user.promptsUsed >= promptLimit) {
      return res.status(403).json({ error: "Monthly prompt limit reached" });
    }

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

    await prisma.user.update({
      where: { id: req.user.id },
      data: { promptsUsed: { increment: 1 } }
    });

    res.json({
      response: `${responseText}\n\nFollow-up questions:\n${followUps}`
    });

  } catch (error) {
    console.error("❌ Chat error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// 🛒 Shopify Routes
app.use('/shopify', shopifyAuth);
app.use('/shopify', userDashboard);
app.use('/shopify', adminDashboard);

// ❌ Catch-all fallback
app.get("*", (req, res) => {
  res.status(404).send("Not Found – make sure the route exists.");
});

module.exports = app;
