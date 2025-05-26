// src/lib/stripeProducts.ts

export const stripeProducts = {
  free: {
    id: 'prod_SAd30GhAwf8tOS',
    name: 'Free Plan',
    price: 0,
    features: ['5 prompts per month', 'Basic access'],
  },
  personal: {
    id: 'prod_SAd3pZ6Gn3dmCI',
    name: 'Personal Plan',
    price: 8.99,
    features: ['Unlimited prompts', 'Priority support'],
  },
  business: {
    id: 'prod_SAd54Eou7u2TmH',
    name: 'Business Plan',
    price: 49.99,
    features: ['1200 prompts/month', '3 users included', 'Advanced insights'],
  },
  enterprise: {
    id: 'prod_SAd69obV6WEuUb',
    name: 'Enterprise Plan',
    price: null,
    features: ['Custom usage limits', 'Dedicated support', 'Team onboarding'],
  },
};
