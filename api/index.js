import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import bodyParser from "body-parser";

dotenv.config();
const app = express();

// Basic middleware setup
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/chat", async (req, res) => {
  try {
    console.log('Received request:', req.body);
    
    if (!req.body || !req.body.message) {
      return res.status(400).json({
        error: "Missing message in request body"
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: req.body.message }]
    });

    res.json({
      success: true,
      response: completion.choices[0].message.content
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default app;
