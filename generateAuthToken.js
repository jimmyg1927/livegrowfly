import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

async function generateAuthToken() {
  try {
    console.log("Connecting to the database...");
    // Get a user from the database
    const user = await prisma.user.findFirst();  // Get the first user
    
    if (!user) {
      console.log("No user found! Create a user first.");
      return;
    }

    console.log("User found:", user);

    // Generate JWT token for the user
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("Generated Token:", token);
  } catch (error) {
    console.error("Error generating token:", error);
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected from the database.");
  }
}

generateAuthToken();