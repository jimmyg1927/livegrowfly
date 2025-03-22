import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

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

const SUBSCRIPTION_LIMITS = {
  free: 10,
  basic: 50,
  premium: 100
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/chat", authenticateUser, async (req, res) => {
  try {
    const { message } = req.body;
    
    const promptLimit = SUBSCRIPTION_LIMITS[req.user.subscriptionType];
    if (req.user.promptsUsed >= promptLimit) {
      return res.status(403).json({
        error: "Monthly prompt limit reached"
      });
    }

    // Make a request to OpenAI API
    const response = await openai.Completions.create({
      model: "text-davinci-003",
      prompt: message,
      max_tokens: 150
    });

    // Update the user's promptsUsed count
    await prisma.user.update({
      where: { id: req.user.id },
      data: { promptsUsed: { increment: 1 } }
    });

    res.json({ response: response.choices[0].text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
