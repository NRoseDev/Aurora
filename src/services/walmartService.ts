// src/services/walmartService.ts

import { UnifiedProduct } from '../types';

export class WalmartService {
  private clientId: string;
  private clientSecret: string;
  private accessToken?: string;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  private async getAccessToken(): Promise<string> {
    const credentials = btoa(
      `${this.clientId}:${this.clientSecret}`
    );

    const response = await fetch(
      'https://marketplace.walmartapis.com/v3/token',
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'WM_SVC.NAME': 'Aurora Dashboard',
        },
        body: 'grant_type=client_credentials',
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to authenticate with Walmart: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data?.access_token) {
      throw new Error('Walmart authentication response missing access token');
    }

    this.accessToken = data.access_token;
    return this.accessToken;
  }

  public async fetchListings(): Promise<UnifiedProduct[]> {
    const token =
      this.accessToken || (await this.getAccessToken());

    const response = await fetch(
      'https://marketplace.walmartapis.com/v3/items?limit=50',
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'WM_SEC.ACCESS_TOKEN': token,
          Accept: 'application/json',
          'WM_SVC.NAME': 'Aurora Dashboard',
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Walmart listings: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!Array.isArray(data?.itemResponse)) {
      return [];
    }

    return this.normalize(data.itemResponse);
  }

  private normalize(items: any[]): UnifiedProduct[] {
    return items.map((item) => {
      const sku = item.sku || item.itemIdentifiers?.sku || '';

      return {
        id: `walmart-${sku}`,
        platform: 'walmart',
        title: item.productName || sku || 'Untitled',
        price: Number.parseFloat(
          String(item.price?.amount ?? item.price ?? 0)
        ) || 0,
        currency: item.price?.currency || 'USD',
        inventory: Number(item.inventory?.quantity ?? 0),
        status: item.lifecycleStatus || 'ACTIVE',
      };
    });
  }
}
