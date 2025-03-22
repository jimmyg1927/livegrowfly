import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const prisma = new PrismaClient();

async function generateToken() {
  try {
    // 👤 Get the first user from your DB (or change the logic to fetch by email)
    const user = await prisma.user.findFirst();

    if (!user) {
      console.log("❌ No user found. Create one first.");
      return;
    }

    // 🔐 Create a JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ Generated Token:\n", token);
  } catch (error) {
    console.error("⚠️ Error generating token:", error);
  } finally {
    await prisma.$disconnect();
  }
}

generateToken();
