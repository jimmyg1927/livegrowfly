import Shopify, { ApiVersion } from '@shopify/shopify-api';
import Koa from 'koa';
import Router from 'koa-router';
import dotenv from 'dotenv';

dotenv.config();

const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET, SHOPIFY_SCOPES, SHOPIFY_SHOP } = process.env;

Shopify.Context.initialize({
  API_KEY: SHOPIFY_API_KEY,
  API_SECRET_KEY: SHOPIFY_API_SECRET,
  SCOPES: SHOPIFY_SCOPES.split(','),
  HOST_NAME: SHOPIFY_SHOP,
  API_VERSION: ApiVersion.October21,
  IS_EMBEDDED_APP: true,
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

const app = new Koa();
const router = new Router();

router.get('/auth', async (ctx) => {
  const authRoute = await Shopify.Auth.beginAuth(
    ctx.req,
    ctx.res,
    SHOPIFY_SHOP,
    '/auth/callback',
    false,
  );
  ctx.redirect(authRoute);
});

router.get('/auth/callback', async (ctx) => {
  try {
    await Shopify.Auth.validateAuthCallback(ctx.req, ctx.res, ctx.query);
    ctx.redirect('/');
  } catch (error) {
    console.error(error);
    ctx.throw(500, 'Authentication failed');
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

export default app;