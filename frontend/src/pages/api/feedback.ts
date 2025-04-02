import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma"; // Assuming you're using Prisma for database

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { responseId, userId, vote, comment } = req.body;

  if (!responseId || !userId || !vote) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Save feedback to the database
    await prisma.feedback.create({
      data: {
        responseId,
        userId,
        vote,
        comment,
      },
    });

    res.status(200).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}