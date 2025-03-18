import express from "express";
import dotenv from "dotenv";
import { OpenAIApi, Configuration } from "openai";

dotenv.config();

const app = express();
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: message }],
    });

    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    console.error("OpenAI API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default app;
