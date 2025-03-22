import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// 🔐 Middleware: Authenticate user from JWT
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) throw new Error("User not found");
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// 🔢 Subscription prompt limits
const SUBSCRIPTION_LIMITS = {
  free: 5,
  personal: 200,
  professional: 750,
  business: 3500,
};

// 🤖 OpenAI SDK (v4) setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 Chat endpoint with GPT-4 Turbo
app.post("/api/chat", authenticateUser, async (req, res) => {
  try {
    const { message } = req.body;

    const promptLimit = SUBSCRIPTION_LIMITS[req.user.subscriptionType] || 5;
    if (req.user.promptsUsed >= promptLimit) {
      return res.status(403).json({ error: "Monthly prompt limit reached" });
    }

    // 🔥 Request to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant specialised in marketing, branding, business ideas, and social media. Provide helpful and relevant responses.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const responseContent = completion.choices[0].message.content;

    // ➕ Update prompt count
    await prisma.user.update({
      where: { id: req.user.id },
      data: { promptsUsed: { increment: 1 } },
    });

    res.json({ response: responseContent });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default app;
