// src/services/ebayService.ts

import { UnifiedProduct } from '../types';

export class EbayService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  public async fetchListings(): Promise<UnifiedProduct[]> {
    const response = await fetch('https://api.ebay.com/sell/inventory/v1/inventory_item?limit=50', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'en-US',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch eBay listings: ${response.statusText}`);
    }

    const data = await response.json();
    return this.normalize(data.inventoryItems || []);
  }

  private normalize(items: any[]): UnifiedProduct[] {
    return items.map((item) => {
      const product = item.product || {};
      const availability = item.availability?.shipToLocationAvailability || {};
      
      return {
        id: `ebay-${item.sku}`,
        platform: 'ebay',
        title: product.title || item.sku,
        price: product.aspects?.Price?.[0] ? parseFloat(product.aspects.Price[0]) : 0,
        currency: 'USD',
        inventory: availability.quantity || 0,
        status: item.availability ? 'ACTIVE' : 'INACTIVE',
      };
    });
  }
}
