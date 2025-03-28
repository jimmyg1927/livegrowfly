const express = require("express");

const router = express.Router();

router.get("/user-dashboard", (req, res) => {
  console.log("Accessed /shopify/user-dashboard");
  res.send("User Dashboard");
});

module.exports = router;
