const express = require('express');
const router = express.Router();
const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
const InMemorySessionStorage = require('./InMemorySessionStorage');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Shopify context init
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  hostName: process.env.SHOPIFY_APP_URL.replace(/^https:\/\//, ''),
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  sessionStorage: new InMemorySessionStorage(),
});

// Route to start auth
router.get('/shopify/auth', async (req, res) => {
  try {
    const authRoute = await shopify.auth.begin({
      shop: req.query.shop,
      callbackPath: '/shopify/callback',
      isOnline: true,
      rawRequest: req,
      rawResponse: res,
    });
    return res.redirect(authRoute);
  } catch (err) {
    console.error('Error during Shopify auth begin:', err);
    return res.status(500).send('Auth begin error');
  }
});

// Route to handle callback
router.get('/shopify/callback', async (req, res) => {
  try {
    const session = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    // JWT for the dashboard
    const token = jwt.sign(
      { shop: session.shop },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.redirect(`${process.env.SHOPIFY_APP_URL}/dashboard?token=${token}`);
  } catch (e) {
    console.error('OAuth Callback Error:', e);
    res.status(500).send('Callback failed');
  }
});

module.exports = router;
