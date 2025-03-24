import Router from 'koa-router';

const router = new Router();

router.get('/admin-dashboard', async (ctx) => {
  // Fetch admin data and render the admin dashboard
  ctx.body = 'Admin Dashboard';
});

export default router;