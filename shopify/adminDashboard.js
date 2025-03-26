const express = require('express');

const router = express.Router();

router.get('/admin-dashboard', (req, res) => {
  // Fetch admin data and render the admin dashboard
  res.send('Admin Dashboard');
});

module.exports = router;