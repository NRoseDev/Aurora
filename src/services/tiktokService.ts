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
    const response = await fetch(
      `https://open-api.tiktokglobalshop.com/product/202309/shops/${this.shopId}/products/search`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          page_size: 50,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch TikTok products: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data?.data?.products)) {
      return [];
    }

    return this.normalize(data.data.products);
  }

  private normalize(items: any[]): UnifiedProduct[] {
    return items.map((item) => {
      const sku = item.skus?.[0];
      const price = sku?.price?.original_price;

      return {
        id: `tiktok-${item.id}`,
        platform: 'tiktok',
        title: item.name || 'Untitled',
        price: Number.parseFloat(String(price ?? 0)) || 0,
        currency: sku?.price?.currency || 'USD',
        inventory: Number(sku?.inventory?.[0]?.quantity ?? 0),
        status: item.status || 'ACTIVE',
      };
    });
  }
}
