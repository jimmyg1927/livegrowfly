import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();

// Add more robust JSON parsing error handling
app.use(express.json({
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ 
        error: 'Invalid JSON',
        details: e.message 
      });
      throw new Error('Invalid JSON');
    }
  }
}));

// Add CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  next();
});

// Handle OPTIONS requests
app.options('/api/chat', (req, res) => {
  res.status(200).end();
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    
    console.log('Received body:', JSON.stringify(req.body, null, 2));
    
    if (!message) {
      return res.status(400).json({ 
        error: "Message is required",
        received: req.body 
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: message }],
      max_tokens: 1000
    });

    res.json({ response: response.choices[0].message.content });
  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ 
      error: "Internal server error",
      message: error.message 
    });
  }
});

// Add a health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

export default app;
