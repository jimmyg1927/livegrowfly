import Router from 'koa-router';

const router = new Router();

router.get('/user-dashboard', async (ctx) => {
  // Fetch user data and render the user dashboard
  ctx.body = 'User Dashboard';
});

export default router;