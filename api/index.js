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
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("No token provided");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) throw new Error("User not found");
    req.user = user;
    next();
  } catch (error) {
    console.error("🔐 Auth Error:", error);
    res.status(401).json({ error: "Invalid token", details: error.message });
  }
};

// 🧠 Subscription limits
const SUBSCRIPTION_LIMITS = {
  free: 5,
  personal: 200,
  professional: 750,
  business: 3500
};

// 🧠 OpenAI setup
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// 🤖 Chat endpoint
app.post("/api/chat", authenticateUser, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });

    const promptLimit = SUBSCRIPTION_LIMITS[req.user.subscriptionType] || 5;

    if (req.user.promptsUsed >= promptLimit) {
      return res.status(403).json({ error: "Monthly prompt limit reached" });
    }

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant specialised in marketing, branding, business ideas, and social media. Always provide useful answers and include follow-up questions."
        },
        { role: "user", content: message }
      ]
    });

    const responseContent = completion.data.choices[0].message.content;

    // Update user's prompt usage
    await prisma.user.update({
      where: { id: req.user.id },
      data: { promptsUsed: { increment: 1 } }
    });

    // Custom follow-up questions
    const followUps = [
      "What specific marketing goal are you targeting?",
      "What’s your target audience?",
      "Would you like ideas for Instagram, TikTok, or LinkedIn?",
      "Are you focused on brand awareness or lead generation?"
    ];

    const responseWithFollowUps = `${responseContent}\n\nFollow-up questions:\n1. ${followUps[0]}\n2. ${followUps[1]}`;

    res.json({ response: responseWithFollowUps });
  } catch (error) {
    console.error("🔥 API Crash:", error);
    res.status(500).json({
      error: "Something went wrong",
      details: error.message || "Unknown error"
    });
  }
});

export default app;

