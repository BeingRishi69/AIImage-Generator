'use server';

import { supabase } from '@/app/lib/supabase';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price_monthly: number;
  price_yearly: number;
  credits_per_month: number;
  features: any;
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  starts_at: string;
  expires_at?: string;
  is_active: boolean;
  payment_provider?: string;
  payment_reference?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get all subscription plans
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('price_monthly', { ascending: true });
  
  if (error) {
    console.error('Error fetching subscription plans:', error);
    return [];
  }
  
  return data as SubscriptionPlan[];
}

/**
 * Get a specific subscription plan by ID
 */
export async function getSubscriptionPlanById(planId: string): Promise<SubscriptionPlan | null> {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .single();
  
  if (error) {
    console.error('Error fetching subscription plan:', error);
    return null;
  }
  
  return data as SubscriptionPlan;
}

/**
 * Get a user's active subscription
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No subscription found - not an error
      return null;
    }
    console.error('Error fetching user subscription:', error);
    return null;
  }
  
  return data as UserSubscription;
}

/**
 * Create or update a user subscription
 */
export async function createOrUpdateSubscription(subscriptionData: {
  user_id: string;
  plan_id: string;
  starts_at?: Date;
  expires_at?: Date;
  payment_provider?: string;
  payment_reference?: string;
}): Promise<UserSubscription | null> {
  // First, deactivate any existing active subscriptions
  const { error: deactivateError } = await supabase
    .from('user_subscriptions')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('user_id', subscriptionData.user_id)
    .eq('is_active', true);
  
  if (deactivateError) {
    console.error('Error deactivating existing subscriptions:', deactivateError);
  }
  
  // Create the new subscription
  const newSubscription = {
    user_id: subscriptionData.user_id,
    plan_id: subscriptionData.plan_id,
    starts_at: (subscriptionData.starts_at || new Date()).toISOString(),
    expires_at: subscriptionData.expires_at ? subscriptionData.expires_at.toISOString() : null,
    is_active: true,
    payment_provider: subscriptionData.payment_provider,
    payment_reference: subscriptionData.payment_reference,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('user_subscriptions')
    .insert(newSubscription)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating subscription:', error);
    return null;
  }
  
  return data as UserSubscription;
}

/**
 * Cancel a user's subscription
 */
export async function cancelSubscription(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_subscriptions')
    .update({ 
      is_active: false, 
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('is_active', true);
  
  if (error) {
    console.error('Error canceling subscription:', error);
    return false;
  }
  
  return true;
}

/**
 * Get a user's remaining credits
 */
export async function getUserRemainingCredits(userId: string): Promise<number> {
  // Get the user's subscription
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    // Default to free plan
    const freePlan = await getSubscriptionPlanById('free');
    return freePlan ? freePlan.credits_per_month : 0;
  }
  
  // Get the subscription plan
  const plan = await getSubscriptionPlanById(subscription.plan_id);
  if (!plan) return 0;
  
  // Calculate credits used this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const { data, error } = await supabase
    .from('usage_records')
    .select('credits_used')
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString());
  
  if (error) {
    console.error('Error fetching usage records:', error);
    return 0;
  }
  
  const creditsUsed = data.reduce((sum, record) => sum + record.credits_used, 0);
  
  return Math.max(0, plan.credits_per_month - creditsUsed);
} 