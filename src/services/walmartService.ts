// src/services/walmartService.ts

import { UnifiedProduct } from '../types';

export class WalmartService {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  private async getAccessToken(): Promise<string> {
    const credentials = btoa(`${this.clientId}:${this.clientSecret}`);
    const response = await fetch('https://marketplace.walmartapis.com/v3/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'WM_SVC.NAME': 'Aurora Dashboard',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`Failed to authenticate with Walmart: ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    return this.accessToken;
  }

  public async fetchListings(): Promise<UnifiedProduct[]> {
    const token = this.accessToken || (await this.getAccessToken());

    const response = await fetch('https://marketplace.walmartapis.com/v3/items?limit=50', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'WM_SEC.ACCESS_TOKEN': token,
        'Accept': 'application/json',
        'WM_SVC.NAME': 'Aurora Dashboard',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Walmart listings: ${response.statusText}`);
    }

    const data = await response.json();
    return this.normalize(data.itemResponse || []);
  }

  private normalize(items: any[]): UnifiedProduct[] {
    return items.map((item) => ({
      id: `walmart-${item.sku || item.itemIdentifiers?.sku}`,
      platform: 'walmart',
      title: item.productName || item.sku,
      price: item.price ? parseFloat(item.price.amount) : 0,
      currency: item.price ? item.price.currency : 'USD',
      inventory: item.inventory ? item.inventory.quantity : 0,
      status: item.lifecycleStatus || 'ACTIVE',
    }));
  }
}
