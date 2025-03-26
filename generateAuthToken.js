const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
import { PrismaClient } from "@prisma/client";

dotenv.config();
const prisma = new PrismaClient();

const generateAuthToken = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  return token;
};

// Example usage
const userId = 'exampleUserId';
const token = generateAuthToken(userId);
console.log('Generated JWT Token:', token);

async function main() {
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
    const token = generateAuthToken(user.id);

    console.log("Generated Token:", token);
  } catch (error) {
    console.error("Error generating token:", error);
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected from the database.");
  }
}

main();