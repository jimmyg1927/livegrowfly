import express from "express";
import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// 🔐 Auth middleware
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
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

// 🧠 Subscription limits
const SUBSCRIPTION_LIMITS = {
  free: 5,
  personal: 200,
  professional: 750,
  business: 3250
};

// 🧠 OpenAI new SDK
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// 🤖 Chat endpoint
app.post("/api/chat", authenticateUser, async (req, res) => {
  try {
    const { message } = req.body;

    const promptLimit = SUBSCRIPTION_LIMITS[req.user.subscriptionType] || 5;
    if (req.user.promptsUsed >= promptLimit) {
      return res.status(403).json({
        error: "Monthly prompt limit reached"
      });
    }

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo", // or gpt-4 if you have access
      messages: [
        { role: "system", content: "You are an AI assistant specialized in marketing, branding, business ideas, and social media. Provide helpful and relevant responses. Always include at least two follow-up questions that entice the user to ask another question or pre-empt what they may ask next." },
        { role: "user", content: message }
      ]
    });

    await prisma.user.update({
      where: { id: req.user.id },
      data: { promptsUsed: { increment: 1 } }
    });

    const responseContent = completion.data.choices[0].message.content;

    // Add follow-up questions
    const followUpQuestions = [
      "What specific aspect of marketing are you interested in?",
      "Do you have any particular branding goals in mind?",
      "Are you looking for business ideas in a specific industry?",
      "What social media platforms are you focusing on?"
    ];

    const responseWithFollowUps = `${responseContent}\n\nFollow-up questions:\n1. ${followUpQuestions[0]}\n2. ${followUpQuestions[1]}`;

    res.json({ response: responseWithFollowUps });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default app;
