import express from 'express';

const router = express.Router();

router.get('/user-dashboard', (req, res) => {
  // Fetch user data and render the user dashboard
  res.send('User Dashboard');
});

router.get('/admin-dashboard', (req, res) => {
  // Fetch admin data and render the admin dashboard
  res.send('Admin Dashboard');
});

export default router;