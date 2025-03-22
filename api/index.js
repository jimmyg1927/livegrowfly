import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
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
  free: 10,
  basic: 50,
  premium: 100
};

// 🧠 OpenAI new SDK
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 🤖 Chat endpoint
app.post("/api/chat", authenticateUser, async (req, res) => {
  try {
    const { message } = req.body;

    const promptLimit = SUBSCRIPTION_LIMITS[req.user.subscriptionType] || 10;
    if (req.user.promptsUsed >= promptLimit) {
      return res.status(403).json({
        error: "Monthly prompt limit reached"
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // or gpt-4 if you have access
      messages: [
        { role: "user", content: message }
      ]
    });

    await prisma.user.update({
      where: { id: req.user.id },
      data: { promptsUsed: { increment: 1 } }
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default app;
