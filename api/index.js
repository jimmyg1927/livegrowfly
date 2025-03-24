import express from "express";
import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

import shopifyAuth from "../shopify/shopifyAuth.js";
import userDashboard from "../shopify/userDashboard.js";
import adminDashboard from "../shopify/adminDashboard.js";

dotenv.config();
const app = express();

// 🧠 Prisma setup with hot-reloading support (optional but great for dev/serverless)
const globalForPrisma = global;
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// 🧠 OpenAI instance
const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

app.use(express.json());

// 🔐 Auth middleware
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("No token provided");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) throw new Error("User not found");

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

// 🎯 Subscription prompt limits
const SUBSCRIPTION_LIMITS = {
  free: 5,
  personal: 200,
  professional: 750,
  business: 3500,
};

// 🤖 AI Chat endpoint
app.post("/api/chat", authenticateUser, async (req, res) => {
  try {
    const { message } = req.body;
    const promptLimit = SUBSCRIPTION_LIMITS[req.user.subscriptionType] || 5;

    if (req.user.promptsUsed >= promptLimit) {
      return res.status(403).json({ error: "Monthly prompt limit reached" });
    }

    // 🧠 Main assistant response
    const mainResponse = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that provides advice on marketing, branding, business ideas, and social media. Be concise, strategic, and encouraging.",
        },
        { role: "user", content: message },
      ],
      max_tokens: 300,
    });

    // 🧠 Follow-up question suggestions
    const followUpResponse = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an AI that generates 2 short follow-up questions
