const express = require("express");
const { shopifyApi, LATEST_API_VERSION } = require("@shopify/shopify-api");
const { restResources } = require("@shopify/shopify-api/rest/admin/2023-10");
const InMemorySessionStorage = require("./InMemorySessionStorage");

// ✅ Register the Node adapter
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

// STEP 1: Begin OAuth
router.get("/auth", async (req, res) => {
  try {
    const shop = req.query.shop;
    if (!shop) return res.status(400).send("Missing shop query param");

    const authRoute = await shopify.auth.begin({
      shop,
      callbackPath: "/shopify/auth/callback",
      isOnline: true,
      rawRequest: req,
      rawResponse: res,
    });

    return res.redirect(authRoute);
  } catch (err) {
    console.error("Auth start error:", err);
    return res.status(500).send("Failed to start Shopify OAuth");
  }
});

// STEP 2: OAuth Callback
router.get("/auth/callback", async (req, res) => {
  try {
    const session = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    console.log("✅ Authenticated Shopify session:", session);
    return res.redirect("/shopify/user-dashboard");
  } catch (err) {
    console.error("Auth callback error:", err);
    return res.status(500).send("OAuth callback failed");
  }
});

module.exports = router;
