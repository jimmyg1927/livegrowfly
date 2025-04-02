import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma"; // Adjust the import path based on your project structure

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { title, content, createdById } = req.body;

  if (!title || !content || !createdById) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const document = await prisma.document.create({
      data: {
        title,
        content,
        createdById,
      },
    });

    res.status(200).json(document);
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}