import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma"; // Adjust the import path based on your project structure

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "PUT") {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      const updatedDocument = await prisma.document.update({
        where: { id: id as string },
        data: { title, content },
      });

      res.status(200).json(updatedDocument);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}