// src/services/etsyService.ts

import { UnifiedProduct } from '../types';

export class EtsyService {
  private apiKey: string;
  private shopId: string;

  constructor(apiKey: string, shopId: string) {
    this.apiKey = apiKey;
    this.shopId = shopId;
  }

  public async fetchListings(): Promise<UnifiedProduct[]> {
    const response = await fetch(
      `https://openapi.etsy.com/v3/application/shops/${this.shopId}/listings/active`,
      {
        headers: {
          'x-api-key': this.apiKey,
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Etsy listings: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data?.results)) {
      return [];
    }

    return this.normalize(data.results);
  }

  private normalize(items: any[]): UnifiedProduct[] {
    return items.map((item) => ({
      id: `etsy-${item.listing_id}`,
      platform: 'etsy',
      title: item.title || 'Untitled',
      price:
        Number(item.price?.amount ?? 0) /
        Number(item.price?.divisor || 1),
      currency: item.price?.currency_code || 'USD',
      inventory: Number(item.quantity ?? 0),
      status: item.state || 'active',
    }));
  }
}
