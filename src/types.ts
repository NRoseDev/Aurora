export type Page = 'dashboard' | 'orders' | 'analytics' | 'scrapbook' | 'snap2fit';

export type SubscriptionTier = 'free' | 'creator' | 'pro' | 'enterprise';

export interface UnifiedProduct {
  id: string;
  platform: string;
  title: string;
  price: number;
  currency: string;
  inventory: number;
  status: string;
}
