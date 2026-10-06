export type Page = 'dashboard' | 'orders' | 'analytics' | 'scrapbook' | 'snap2fit' | 'sizemeup';

/** A finished design handed from one in-app tool to another (Snap 2 Fit -> Size Me Up). */
export interface SharedDesign {
  url: string;
  name: string;
  width: number;
  height: number;
  productLabel: string;
}

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
