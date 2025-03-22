import express from "express";
import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

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
      throw new Error("User not found");
    }
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// 🧠 Subscription limits
const SUBSCRIPTION_LIMITS = {
  free: 5,
  personal: 200,
  professional: 750,
  business: 3250
};

// 🤖 OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

// 🧠 AI chat endpoint
app.post("/api/chat", authenticateUser, async (req, res) => {
  try {
    const { message } = req.body;

    // Input validation
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required and must be a string" });
    }

    const promptLimit = SUBSCRIPTION_LIMITS[req.user.subscriptionType] || 5;
    if (req.user.promptsUsed >= promptLimit) {
      return res.status(403).json({
        error: "Monthly prompt limit reached"
      });
    }

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo", // Or gpt-4 if you’re on that plan
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant specialized in marketing, branding, business ideas, and social media. Provide helpful and relevant responses. Always include at least two follow-up questions that entice the user to continue."
        },
        {
          role: "user",
          content: message
        }
      ]
    });

    const responseContent = completion.data.choices[0].message.content;

    // Update prompt usage
    await prisma.user.update({
      where: { id: req.user.id },
      data: { promptsUsed: { increment: 1 } }
    });

    // 📋 Dynamic follow-up suggestions
    const followUpQuestions = [
      "What specific aspect of marketing are you interested in?",
      "Do you have any particular branding goals in mind?",
      "Are you looking for business ideas in a specific industry?",
      "What social media platforms are you focusing on?"
    ];

    const followUpsFormatted = followUpQuestions
      .map((q, i) => `${i + 1}. ${q}`)
      .join("\n");

    const responseWithFollowUps = `${responseContent}\n\nFollow-up questions:\n${followUpsFormatted}`;

    res.json({ response: responseWithFollowUps });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default app;
