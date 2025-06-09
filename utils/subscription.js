// utils/subscription.js - Centralized subscription validation logic

/**
 * Checks if a user has a valid paid subscription
 * A user has a valid subscription if:
 * 1. They're on free plan (always valid), OR
 * 2. They have a stripeCustomerId (proving they've paid), OR  
 * 3. They have a billingStartDate (backup proof of payment)
 */
export function hasValidSubscription(user) {
  if (!user) return false
  
  // Free plan is always valid
  if (user.subscriptionType === 'free') return true
  
  // Paid plans need proof of payment
  return !!(user.stripeCustomerId || user.billingStartDate)
}

/**
 * Gets the user's effective subscription type
 * If they haven't paid, force them back to free regardless of what's in subscriptionType
 */
export function getEffectiveSubscription(user) {
  return hasValidSubscription(user) ? user.subscriptionType : 'free'
}

/**
 * Gets the correct prompt limit based on effective subscription
 */
export function getPromptLimit(user) {
  const effectivePlan = getEffectiveSubscription(user)
  
  switch (effectivePlan?.toLowerCase()) {
    case 'personal': return 400
    case 'business': return 2000  
    case 'enterprise': return 999999
    default: return 20 // Free plan (matches your UI showing 20)
  }
}

/**
 * Gets the correct subscription badge info for display
 */
export function getSubscriptionBadge(user) {
  const effectivePlan = getEffectiveSubscription(user)
  
  switch (effectivePlan?.toLowerCase()) {
    case 'personal':
      return { 
        label: 'Personal', 
        color: 'bg-gradient-to-r from-blue-500 to-indigo-500', 
        icon: 'Crown' 
      }
    case 'business':
      return { 
        label: 'Business', 
        color: 'bg-gradient-to-r from-purple-500 to-pink-500', 
        icon: 'Crown' 
      }
    case 'enterprise':
      return { 
        label: 'Enterprise', 
        color: 'bg-gradient-to-r from-amber-400 to-orange-500', 
        icon: 'Crown' 
      }
    default:
      return { 
        label: 'Free', 
        color: 'bg-gradient-to-r from-gray-400 to-gray-500', 
        icon: null 
      }
  }
}

/**
 * Check if user can use a feature based on their plan
 */
export function canUseFeature(user, feature) {
  const effectivePlan = getEffectiveSubscription(user)
  
  const planFeatures = {
    free: ['basic_ai', 'save_responses'],
    personal: ['basic_ai', 'save_responses', 'advanced_ai', 'brand_generator', 'pdf_export'],
    business: ['basic_ai', 'save_responses', 'advanced_ai', 'brand_generator', 'pdf_export', 'team_collab', 'analytics'],
    enterprise: ['basic_ai', 'save_responses', 'advanced_ai', 'brand_generator', 'pdf_export', 'team_collab', 'analytics', 'custom_training', 'api_access']
  }
  
  return planFeatures[effectivePlan]?.includes(feature) || false
}

/**
 * Get upgrade message for users who need to upgrade
 */
export function getUpgradeMessage(user, requiredPlan = 'personal') {
  const currentPlan = getEffectiveSubscription(user)
  
  if (currentPlan === 'free') {
    return `Upgrade to ${requiredPlan} plan to unlock this feature`
  }
  
  return `This feature requires ${requiredPlan} plan or higher`
}

/**
 * Validate if user can make more prompts
 */
export function canMakePrompt(user) {
  if (!user) return false
  
  const limit = getPromptLimit(user)
  const used = user.promptsUsed || 0
  
  return used < limit
}

/**
 * Get remaining prompts for user
 */
export function getRemainingPrompts(user) {
  if (!user) return 0
  
  const limit = getPromptLimit(user)
  const used = user.promptsUsed || 0
  
  return Math.max(0, limit - used)
}