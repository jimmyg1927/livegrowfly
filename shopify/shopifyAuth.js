const express = require("express");
const { shopifyApi, LATEST_API_VERSION } = require("@shopify/shopify-api");
const dotenv = require("dotenv");
dotenv.config();

const router = express.Router();

// 🔐 Ensure required env vars are defined
if (
  !process.env.SHOPIFY_API_KEY ||
  !process.env.SHOPIFY_API_SECRET ||
  !process.env.SHOPIFY_APP_URL ||
  !process.env.SHOPIFY_SCOPES ||
  !process.env.SHOPIFY_SHOP
) {
  console.error("❌ Missing Shopify environment variables");
  process.exit(1);
}

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(","),
  hostName: process.env.SHOPIFY_APP_URL.replace(/^https?:\/\//, ""),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
});

router.get("/auth", async (req, res) => {
  const shop = process.env.SHOPIFY_SHOP;

  const authRoute = await shopify.auth.begin({
    shop,
    callbackPath: "/auth/callback",
    isOnline: true,
    rawRequest: req,
    rawResponse: res,
  });

  return res.redirect(authRoute);
});

router.get("/auth/callback", async (req, res) => {
  try {
    const session = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    const token = session.accessToken;
    const shop = session.shop;

    console.log("✅ Authenticated", { shop, token });

    // Redirect to frontend with token in query (for JWT creation)
    const redirectUrl = `${process.env.FRONTEND_URL}/dashboard?token=${token}`;
    res.redirect(redirectUrl);
  } catch (err) {
    console.error("❌ Auth callback failed", err);
    res.status(500).send("Auth callback error");
  }
});

module.exports = router;
