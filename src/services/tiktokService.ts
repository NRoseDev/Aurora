// src/services/tiktokService.ts

import { UnifiedProduct } from '../types';

export class TikTokService {
  private accessToken: string;
  private shopId: string;

  constructor(accessToken: string, shopId: string) {
    this.accessToken = accessToken;
    this.shopId = shopId;
  }

  public async fetchListings(): Promise<UnifiedProduct[]> {
    const response = await fetch(`https://open-api.tiktokglobalshop.com/product/202309/shops/${this.shopId}/products/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ page_size: 50 }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch TikTok products: ${response.statusText}`);
    }

    const data = await response.json();
    return this.normalize(data.data?.products || []);
  }

  private normalize(items: any[]): UnifiedProduct[] {
    return items.map((item) => ({
      id: `tiktok-${item.id}`,
      platform: 'tiktok',
      title: item.name,
      price: parseFloat(item.skus?.[0]?.price?.original_price || 0),
      currency: item.skus?.[0]?.price?.currency || 'USD',
      inventory: item.skus?.[0]?.inventory?.[0]?.quantity || 0,
      status: item.status,
    }));
  }
}
