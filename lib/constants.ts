// FILE: lib/constants.ts

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://glowfly-api-production.up.railway.app';

export const defaultFollowUps = [
  'Can you explain that in more detail?',
  'How can I apply this to my business?',
  'Suggest an action plan for this idea.',
  'What tools should I use for this?',
];
