const express = require("express");
const { shopifyApi, LATEST_API_VERSION } = require("@shopify/shopify-api");
const { restResources } = require("@shopify/shopify-api/rest/admin/2023-10");
const InMemorySessionStorage = require("./InMemorySessionStorage");

require("@shopify/shopify-api/adapters/node");
require("dotenv").config();

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(","),
  hostName: process.env.SHOPIFY_APP_URL.replace(/^https?:\/\//, ""),
  isEmbeddedApp: true,
  apiVersion: LATEST_API_VERSION,
  sessionStorage: new InMemorySessionStorage(),
  restResources,
});

const router = express.Router();

// 🔐 Begin OAuth
router.get("/auth", async (req, res) => {
  try {
    const shop = req.query.shop;

    if (!shop || !shop.endsWith(".myshopify.com")) {
      console.error("Invalid or missing shop query parameter:", shop);
      return res.status(400).send("Invalid or missing shop query parameter");
    }

    console.log(`[shopify-api] Beginning OAuth for ${shop}`);

    const authRoute = await shopify.auth.begin({
      shop,
      callbackPath: "/shopify/auth/callback",
      isOnline: true,
      rawRequest: req,
      rawResponse: res,
    });

    if (authRoute) return res.redirect(authRoute);
    return res.status(500).send("Failed to generate auth route");
  } catch (err) {
    console.error("OAuth start error:", err);
    if (!res.headersSent) {
      return res.status(500).send("Failed to start Shopify OAuth");
    }
  }
});

// 🔁 OAuth Callback
router.get("/auth/callback", async (req, res) => {
  try {
    const session = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    console.log("✅ Authenticated session:", session);

    // Redirect into embedded dashboard
    const redirectUrl = `/shopify/user-dashboard?shop=${session.shop}&host=${req.query.host}`;
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error("OAuth callback error:", err);
    if (!res.headersSent) {
      return res.status(500).send("OAuth callback failed");
    }
  }
});

module.exports = router;
