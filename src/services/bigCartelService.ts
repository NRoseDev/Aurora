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
    status: string;
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
        Accept: 'application/vnd.api+json',
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Big Cartel API error: ${response.status} ${response.statusText}`
      );
    }

    const json = await response.json();

    if (!json?.data) {
      throw new Error('Invalid Big Cartel API response');
    }

    return json.data as T;
  }

  public async fetchProducts(): Promise<BigCartelProduct[]> {
    return this.apiRequest<BigCartelProduct[]>(
      `/accounts/${this.accountId}/products`
    );
  }

  public async fetchOrders(): Promise<BigCartelOrder[]> {
    return this.apiRequest<BigCartelOrder[]>(
      `/accounts/${this.accountId}/orders`
    );
  }
}
