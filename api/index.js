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

// Prisma client setup with dev-friendly hot-reload
const globalForPrisma = global;
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["warn", "error"],
  });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

app.use(express.json());

// 🔐 JWT Auth Middleware
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("No token");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) throw new Error("User not found");
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    res.status(401).json({ error: "Invalid or missing token" });
  }
};

// 🎯 Subscription prompt limits
const SUBSCRIPTION_LIMITS = {
  free: 5,
  personal: 200,
  professional: 750,
  business: 3500,
};

// 🤖 AI Chat Route
app.post("/api/chat", authenticateUser, async (req, res) => {
  try {
    const { message } = req.body;
    const promptLimit = SUBSCRIPTION_LIMITS[req.user.subscriptionType] || 5;

    if (req.user.promptsUsed >= promptLimit) {
      return res.status(403).json({ error: "Monthly prompt limit reached" });
    }

    // Main response
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

    // Follow-up suggestions
    const followUpResponse = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are an AI that generates 2 short follow-up questions based on a user's marketing-related input. Return only the questions in a numbered list format.",
        },
        { role: "user", content: message },
      ],
      max_tokens: 100,
    });

    const responseText = mainResponse.data.choices[0].message.content.trim();
    const followUps = followUpResponse.data.choices[0].message.content.trim();

    // Update usage
    await prisma.user.update({
      where: { id: req.user.id },
      data: { promptsUsed: { increment: 1 } },
    });

    res.json({
      response: `${responseText}\n\nFollow-up questions:\n${followUps}`,
    });
  } catch (error) {
    console.error("Chat Route Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Shopify routes
app.use("/shopify", shopifyAuth);
app.use("/shopify", userDashboard);
app.use("/shopify", adminDashboard);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

export default app;
