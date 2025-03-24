import express from 'express';
import { shopifyApi, ApiVersion, LATEST_API_VERSION } from '@shopify/shopify-api';
import dotenv from 'dotenv';

dotenv.config();

const {
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET,
  SHOPIFY_SCOPES,
  SHOPIFY_APP_URL
} = process.env;

const shopify = shopifyApi({
  apiKey: SHOPIFY_API_KEY,
  apiSecretKey: SHOPIFY_API_SECRET,
  scopes: SHOPIFY_SCOPES.split(','),
  hostName: (process.env.SHOPIFY_APP_URL || '').replace(/^https?:\/\//, ''),
  isEmbeddedApp: true,
  apiVersion: ApiVersion.October23,
  sessionStorage: new shopify.session.MemorySessionStorage(),
});

const router = express.Router();

// Start OAuth
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

// Handle OAuth Callback
router.get('/auth/callback', async (req, res) => {
  try {
    const session = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    console.log('✅ Authenticated session:', session);

    return res.redirect('/shopify/user-dashboard'); // Or wherever you want to go after auth
  } catch (err) {
    console.error('Auth callback error:', err);
    return res.status(500).send('OAuth callback failed');
  }
});

export default router;