import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const prisma = new PrismaClient();

async function generateToken() {
  const user = await prisma.user.findFirst(); // assumes one test user exists

  if (!user) {
    console.error("❌ No user found. Create a user first.");
    return;
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  console.log("✅ Generated JWT Token:\n", token);
}

generateToken();
