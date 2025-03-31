const express = require("express");
const router = express.Router();

router.get("/user-dashboard", (req, res) => {
  const { shop, host } = req.query;

  if (!shop || !host) {
    console.warn("Missing shop or host in /user-dashboard request:", req.query);
    return res.status(400).send("Missing shop or host query parameters.");
  }

  console.log("✅ Accessed /shopify/user-dashboard", req.query);

  res.send(`
    <html>
      <head>
        <title>Growfly Dashboard</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script>
          if (window.top === window.self) {
            window.location.href = "https://${shop}/admin/apps/growfly";
          }
        </script>
      </head>
      <body>
        <h1>✅ Growfly Installed & Running</h1>
        <p>Welcome! This confirms your embedded app loaded successfully inside Shopify.</p>
        <p>Shop: <strong>${shop}</strong></p>
        <p>Host: <strong>${host}</strong></p>
      </body>
    </html>
  `);
});

module.exports = router;
