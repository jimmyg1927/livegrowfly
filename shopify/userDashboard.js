import express from 'express';

const router = express.Router();

router.get('/user-dashboard', (req, res) => {
  // Fetch user data and render the user dashboard
  res.send('User Dashboard');
});

export default router;
