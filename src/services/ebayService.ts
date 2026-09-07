// src/services/ebayService.ts

import { UnifiedProduct } from '../types';

export class EbayService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  public async fetchListings(): Promise<UnifiedProduct[]> {
    const response = await fetch(
      'https://api.ebay.com/sell/inventory/v1/inventory_item?limit=50',
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: 'application/json',
          'Accept-Language': 'en-US',
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch eBay listings: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data?.inventoryItems)) {
      return [];
    }

    return this.normalize(data.inventoryItems);
  }

  private normalize(items: any[]): UnifiedProduct[] {
    return items.map((item) => {
      const product = item.product || {};
      const availability =
        item.availability?.shipToLocationAvailability || {};

      const priceValue =
        item.product?.aspects?.Price?.[0] ??
        item.price?.value ??
        item.price ??
        0;

      return {
        id: `ebay-${item.sku}`,
        platform: 'ebay',
        title: product.title || item.sku || 'Untitled',
        price: Number.parseFloat(String(priceValue)) || 0,
        currency: item.price?.currency || 'USD',
        inventory: availability.quantity ?? 0,
        status: item.availability ? 'ACTIVE' : 'INACTIVE',
      };
    });
  }
}
