import express from 'express';

const router = express.Router();

router.get('/user-dashboard', (req, res) => {
  try {
    console.log('✅ /user-dashboard route hit'); // Logs to Vercel
    // Simulate dashboard logic — you can replace this with real DB fetch
    res.send('✅ User Dashboard is working!');
  } catch (err) {
    console.error('❌ Error in /user-dashboard:', err);
    res.status(500).json({ error: 'Something went wrong on the server' });
  }
});
;

export default router;