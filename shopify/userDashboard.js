const express = require("express");
const router = express.Router();

router.get("/user-dashboard", (req, res) => {
  const { shop, host } = req.query;

  if (!shop || !host) {
    return res.status(400).send("Missing shop or host query params");
  }

  // Basic HTML UI for testing the embedded app
  return res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Growfly.io App</title>
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>
        <script>
          var AppBridge = window['app-bridge'];
          var createApp = AppBridge.default;
          var app = createApp({
            apiKey: "${process.env.SHOPIFY_API_KEY}",
            host: "${host}",
            forceRedirect: true
          });
        </script>
      </head>
      <body>
        <h1 style="font-family: sans-serif;">Welcome to Growfly.io Embedded App</h1>
        <p>The app has successfully loaded inside Shopify Admin.</p>
      </body>
    </html>
  `);
});

module.exports = router;
