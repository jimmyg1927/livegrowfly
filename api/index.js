import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

// Add CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Handle OPTIONS requests
app.options('*', (req, res) => {
  res.status(200).end();
});

// Subscription limits
const SUBSCRIPTION_LIMITS = {
  demo: 10,
  personal: 200,
  entrepreneur: 650,
  business: 4000
};

// Auth middleware
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Enhanced chat endpoint
app.post("/api/chat", authenticateUser, async (req, res) => {
  try {
    const { message } = req.body;
    
    // Check prompt limits
    const promptLimit = SUBSCRIPTION_LIMITS[req.user.subscriptionType];
    if (req.user.promptsUsed >= promptLimit) {
      return res.status(403).json({
        error: "Monthly prompt limit reached"
      });
    }

    // Marketing focus prompt
    const marketingPrompt = `
      As Growfly.io's marketing AI assistant, respond to: "${message}"
      Focus only on marketing, business, analytics, social media, or advertising.
      If unrelated, respond: "I am your growfly.io marketing tool. I cannot answer unrelated questions."
      If related, provide detailed marketing insights and end with two follow-up questions.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: marketingPrompt }]
    });

    // Save prompt
    const prompt = await prisma.prompt.create({
      data: {
        userId: req.user.id,
        question: message,
        response: completion.choices[0].message.content
      }
    });

    // Update usage
    await prisma.user.update({
      where: { id: req.user.id },
      data: { promptsUsed: { increment: 1 } }
    });

    res.json({
      success: true,
      response: completion.choices[0].message.content,
      promptId: prompt.id,
      promptsRemaining: promptLimit - (req.user.promptsUsed + 1)
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Feedback endpoint
app.post("/api/feedback", authenticateUser, async (req, res) => {
  const { promptId, isPositive, comment } = req.body;
  try {
    await prisma.feedback.create({
      data: {
        promptId,
        userId: req.user.id,
        isPositive,
        comment
      }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bookmark endpoints
app.post("/api/bookmarks", authenticateUser, async (req, res) => {
  const { promptId, name } = req.body;
  try {
    const bookmark = await prisma.bookmark.create({
      data: {
        promptId,
        userId: req.user.id,
        name
      }
    });
    res.json({ success: true, bookmark });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user history
app.get("/api/history", authenticateUser, async (req, res) => {
  try {
    const prompts = await prisma.prompt.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { feedback: true, bookmarks: true }
    });
    res.json({ success: true, prompts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default app;

DATABASE_URL="postgresql://username:password@localhost:5432/growfly"
OPENAI_API_KEY="your-key"
JWT_SECRET="your-secret"
