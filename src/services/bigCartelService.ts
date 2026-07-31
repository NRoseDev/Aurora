// src/services/bigCartelService.ts

export interface BigCartelConfig {
  accountId: string;
  accessToken: string;
}

export interface BigCartelProduct {
  id: string;
  type: string;
  attributes: {
    name: string;
    permalink: string;
    description: string;
    status: string; // 'active' | 'sold-out' | 'coming-soon'
    default_price: string;
    created_at: string;
  };
}

export interface BigCartelOrder {
  id: string;
  type: string;
  attributes: {
    status: string;
    total: string;
    created_at: string;
    email: string;
  };
}

export class BigCartelService {
  private accountId: string;
  private accessToken: string;
  private baseUrl = 'https://api.bigcartel.com/v1';

  constructor(config: BigCartelConfig) {
    this.accountId = config.accountId;
    this.accessToken = config.accessToken;
  }

  private async apiRequest<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/vnd.api+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Big Cartel API error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    return json.data;
  }

  public async fetchProducts(): Promise<BigCartelProduct[]> {
    return this.apiRequest<BigCartelProduct[]>(`/accounts/${this.accountId}/products`);
  }

  public async fetchOrders(): Promise<BigCartelOrder[]> {
    return this.apiRequest<BigCartelOrder[]>(`/accounts/${this.accountId}/orders`);
  }
}
