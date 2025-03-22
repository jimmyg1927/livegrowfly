import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

async function generateToken() {
  // Get a user from the database
  const user = await prisma.user.findFirst();  // Get the first user
  
  if (!user) {
    console.log("No user found! Create a user first.");
    return;
  }

  // Generate JWT token for the user
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  console.log("Generated Token:", token);
}

generateToken()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

