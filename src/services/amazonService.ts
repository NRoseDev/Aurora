// src/services/amazonService.ts

import { UnifiedProduct } from '../types';

export class AmazonService {
  private sellerId: string;
  private mwsAuthToken: string;
  private marketplaceId: string;

  constructor(
    sellerId: string,
    mwsAuthToken: string,
    marketplaceId: string
  ) {
    this.sellerId = sellerId;
    this.mwsAuthToken = mwsAuthToken;
    this.marketplaceId = marketplaceId;
  }

  public async fetchListings(): Promise<UnifiedProduct[]> {
    const response = await fetch(
      `https://sellingpartnerapi-na.amazon.com/listings/2021-08-01/items/${this.sellerId}?marketplaceIds=${this.marketplaceId}`,
      {
        headers: {
          'x-amz-access-token': this.mwsAuthToken,
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Amazon listings: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data?.summaries)) {
      return [];
    }

    return this.normalize(data.summaries);
  }

  private normalize(items: any[]): UnifiedProduct[] {
    return items.map((item) => ({
      id: `amazon-${item.asin || item.sku}`,
      platform: 'amazon',
      title: item.itemName || item.sku || 'Untitled',
      price: Number.parseFloat(
        String(item.price?.amount ?? 0)
      ) || 0,
      currency: item.price?.currencyCode || 'USD',
      inventory: Number(
        item.fulfillmentAvailability?.[0]?.quantity ?? 0
      ),
      status: item.status?.[0] || 'ACTIVE',
    }));
  }
}
