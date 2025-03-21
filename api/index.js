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

    // Your OpenAI logic here

    res.json({ response: "Your OpenAI response" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default app;

DATABASE_URL="postgresql://username:password@localhost:5432/growfly"
OPENAI_API_KEY="your-key"
JWT_SECRET="your-secret"
