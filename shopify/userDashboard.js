import express from 'express';
// Optional: import Prisma if you use DB here
// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

const router = express.Router();

router.get('/user-dashboard', async (req, res) => {
  try {
    console.log('✅ HIT /api/shopify/user-dashboard');

    // Optional: if using DB
    // const user = await prisma.user.findFirst();
    // if (!user) throw new Error("No user found");

    res.send('✅ User Dashboard is working!');
  } catch (err) {
    console.error('❌ Error in /user-dashboard:', err.message);
    res.status(500).json({ error: 'Internal server error in user-dashboard' });
  }
});

export default router;
