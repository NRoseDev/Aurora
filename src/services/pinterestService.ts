// src/services/pinterestService.ts

import { UnifiedProduct } from '../types';

export class PinterestService {
  private accessToken: string;
  private merchantId: string;

  constructor(accessToken: string, merchantId: string) {
    this.accessToken = accessToken;
    this.merchantId = merchantId;
  }

  public async fetchProducts(): Promise<UnifiedProduct[]> {
    const response = await fetch(`https://api.pinterest.com/v5/catalogs/feeds/merchants/${this.merchantId}/items`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Pinterest products: ${response.statusText}`);
    }

    const data = await response.json();
    return this.normalize(data.items || []);
  }

  private normalize(items: any[]): UnifiedProduct[] {
    return items.map((item) => ({
      id: `pinterest-${item.item_id}`,
      platform: 'pinterest',
      title: item.title,
      price: parseFloat(item.price) || 0,
      currency: item.currency || 'USD',
      inventory: item.availability === 'IN_STOCK' ? 1 : 0,
      status: item.availability,
    }));
  }
}
