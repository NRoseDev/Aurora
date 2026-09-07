// src/services/woocommerceService.ts

import { UnifiedProduct } from '../types';

export class WooCommerceService {
  private siteUrl: string;
  private consumerKey: string;
  private consumerSecret: string;

  constructor(
    siteUrl: string,
    consumerKey: string,
    consumerSecret: string
  ) {
    this.siteUrl = siteUrl.replace(/\/$/, '');
    this.consumerKey = consumerKey;
    this.consumerSecret = consumerSecret;
  }

  private getAuthHeader(): string {
    const credentials = btoa(
      `${this.consumerKey}:${this.consumerSecret}`
    );

    return `Basic ${credentials}`;
  }

  public async fetchListings(): Promise<UnifiedProduct[]> {
    const response = await fetch(
      `${this.siteUrl}/wp-json/wc/v3/products?per_page=50`,
      {
        headers: {
          Authorization: this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch WooCommerce products: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid WooCommerce products response');
    }

    return this.normalize(data);
  }

  private normalize(items: any[]): UnifiedProduct[] {
    return items.map((item) => ({
      id: `woocommerce-${item.id}`,
      platform: 'woocommerce',
      title: item.name || '',
      price: Number.parseFloat(
        item.price || item.regular_price || '0'
      ),
      currency: item.currency || 'USD',
      inventory: item.stock_quantity ?? (item.in_stock ? 1 : 0),
      status: item.status === 'publish' ? 'ACTIVE' : item.status,
    }));
  }
}
