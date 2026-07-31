// src/services/amazonService.ts

import { UnifiedProduct } from '../types';

export class AmazonService {
  private sellerId: string;
  private mwsAuthToken: string;
  private marketplaceId: string;

  constructor(sellerId: string, mwsAuthToken: string, marketplaceId: string) {
    this.sellerId = sellerId;
    this.mwsAuthToken = mwsAuthToken;
    this.marketplaceId = marketplaceId;
  }

  public async fetchListings(): Promise<UnifiedProduct[]> {
    const response = await fetch(`https://sellingpartnerapi-na.amazon.com/listings/2021-08-01/items/${this.sellerId}?marketplaceIds=${this.marketplaceId}`, {
      headers: {
        'x-amz-access-token': this.mwsAuthToken,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Amazon listings: ${response.statusText}`);
    }

    const data = await response.json();
    return this.normalize(data.summaries || []);
  }

  private normalize(items: any[]): UnifiedProduct[] {
    return items.map((item) => ({
      id: `amazon-${item.asin}`,
      platform: 'amazon',
      title: item.itemName || item.sku,
      price: item.price ? parseFloat(item.price.amount) : 0,
      currency: item.price ? item.price.currencyCode : 'USD',
      inventory: item.fulfillmentAvailability?.[0]?.quantity || 0,
      status: item.status?.[0] || 'ACTIVE',
    }));
  }
}
