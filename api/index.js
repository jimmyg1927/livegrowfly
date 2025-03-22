import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai"; // ✅ Correct import for OpenAI v4+
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// 🔐 Middleware to authenticate user via JWT
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      throw new Error("User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// 🧠 Subscription tiers
const SUBSCRIPTION_LIMITS = {
  free: 5,
  personal: 200,
  professional: 750,
  business: 3500
};

// 🤖 OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 🧠 AI chat route with dynamic follow-ups
app.post("/api/chat", authenticateUser, async (req, res) => {
  try {
    const { message } = req.body;

    const promptLimit = SUBSCRIPTION_LIMITS[req.user.subscriptionType] || 5;
    if (req.user.promptsUsed >= promptLimit) {
      return res.status(403).json({ error: "Monthly prompt limit reached" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant specialised in marketing, branding, business ideas, and social media. Be helpful, insightful and always return two follow-up questions relevant to the user's message.`
        },
        { role: "user", content: message }
      ],
      max_tokens: 400
    });

    const responseContent = completion.choices[0].message.content;

    // Update user's prompt usage
    await prisma.user.update({
      where: { id: req.user.id },
      data: { promptsUsed: { increment: 1 } }
    });

    res.json({ response: responseContent });
  } catch (error) {
    console.error("❌ API Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

export default app;
