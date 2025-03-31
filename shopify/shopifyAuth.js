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

// 🔐 STEP 1: Begin OAuth
router.get("/auth", async (req, res) => {
  try {
    const shop = req.query.shop;

    if (!shop || !shop.endsWith(".myshopify.com")) {
      console.error("❌ Invalid or missing shop query parameter:", shop);
      return res.status(400).send("Invalid or missing shop query parameter");
    }

    console.log(`[shopify-api/INFO] Beginning OAuth for shop: ${shop}`);

    const authRoute = await shopify.auth.begin({
      shop,
      callbackPath: "/shopify/auth/callback",
      isOnline: true,
      rawRequest: req,
      rawResponse: res,
    });

    if (authRoute) {
      console.log(`[shopify-api/INFO] Redirecting to: ${authRoute}`);
      return res.redirect(authRoute);
    } else {
      console.error("❌ Auth route is undefined");
      return res.status(500).send("Failed to generate auth route");
    }
  } catch (err) {
    console.error("❌ OAuth start error:", err);
    if (!res.headersSent) {
      return res.status(500).send("Failed to start Shopify OAuth");
    }
  }
});

// 🔁 STEP 2: OAuth Callback
router.get("/auth/callback", async (req, res) => {
  try {
    const session = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    console.log("✅ Authenticated session:", session);

    const shop = session.shop;
    const host = session.host; // ✅ pulled from session

    if (!shop || !host) {
      console.error("❌ Missing shop or host during callback redirect");
      return res.status(400).send("Missing shop or host during callback redirect");
    }

    // ✅ Redirect into Shopify Admin (embedded app)
    const appHandle = process.env.SHOPIFY_APP_HANDLE || "growfly-io-account";
    return res.redirect(`https://${shop}/admin/apps/${appHandle}`);
  } catch (err) {
    console.error("❌ OAuth callback error:", err);
    if (!res.headersSent) {
      return res.status(500).send("OAuth callback failed");
    }
  }
});

module.exports = router;
