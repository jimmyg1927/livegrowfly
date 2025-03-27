const express = require('express');
const dotenv = require('dotenv');
const { shopifyApi, ApiVersion } = require('@shopify/shopify-api');
const { NodeAdapter } = require('@shopify/shopify-api/adapters/node');
const InMemorySessionStorage = require('./InMemorySessionStorage');

dotenv.config();

const {
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET,
  SHOPIFY_SCOPES,
  SHOPIFY_APP_URL,
} = process.env;

// ✅ Initialize Shopify API with Node adapter and custom in-memory session storage
const shopify = shopifyApi({
  apiKey: SHOPIFY_API_KEY,
  apiSecretKey: SHOPIFY_API_SECRET,
  scopes: SHOPIFY_SCOPES.split(','),
  hostName: (SHOPIFY_APP_URL || '').replace(/^https?:\/\//, ''),
  isEmbeddedApp: true,
  apiVersion: ApiVersion.October23,
  sessionStorage: new InMemorySessionStorage(),
  adapter: new NodeAdapter(), // Add the Node adapter here
});

const router = express.Router();

// 🔐 Begin OAuth
router.get('/auth', async (req, res) => {
  try {
    const shop = req.query.shop;

    if (!shop) return res.status(400).send('Missing shop query param');

    const authRoute = await shopify.auth.begin({
      shop,
      callbackPath: '/shopify/auth/callback',
      isOnline: true,
      rawRequest: req,
      rawResponse: res,
    });

    return res.redirect(authRoute);
  } catch (err) {
    console.error('Auth start error:', err);
    return res.status(500).send('Failed to start Shopify OAuth');
  }
});

// 🔁 Handle OAuth callback
router.get('/auth/callback', async (req, res) => {
  try {
    const session = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    console.log('✅ Authenticated Shopify session:', session);
    return res.redirect('/shopify/user-dashboard');
  } catch (err) {
    console.error('Auth callback error:', err);
    return res.status(500).send('OAuth callback failed');
  }
});

module.exports = router;
