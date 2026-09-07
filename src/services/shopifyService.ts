```ts
// src/services/shopifyService.ts

export interface ShopifyConfig {
  shopDomain: string;
  accessToken: string;
  apiVersion?: string;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  status: string;
  variants: {
    edges: Array<{
      node: {
        id: string;
        price: string;
        sku: string;
        inventoryQuantity: number;
      };
    }>;
  };
  images: {
    edges: Array<{
      node: {
        url: string;
        altText: string | null;
      };
    }>;
  };
}

export interface ShopifyOrder {
  id: string;
  name: string;
  createdAt: string;
  displayFinancialStatus: string;
  displayFulfillmentStatus: string;
  totalPriceSet: {
    shopMoney: {
      amount: string;
      currencyCode: string;
    };
  };
}

export class ShopifyService {
  private shopDomain: string;
  private accessToken: string;
  private apiVersion: string;

  constructor(config: ShopifyConfig) {
    this.shopDomain = config.shopDomain
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '');
    this.accessToken = config.accessToken;
    this.apiVersion = config.apiVersion || '2026-07';
  }

  private async graphqlRequest<T>(
    query: string,
    variables: Record<string, unknown> = {}
  ): Promise<T> {
    const endpoint = `https://${this.shopDomain}/admin/api/${this.apiVersion}/graphql.json`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(
        `Shopify API error: ${response.status} ${response.statusText}`
      );
    }

    const json = await response.json();

    if (json.errors) {
      throw new Error(
        `Shopify GraphQL Error: ${JSON.stringify(json.errors)}`
      );
    }

    return json.data;
  }

  public async fetchProducts(
    first: number = 50
  ): Promise<ShopifyProduct[]> {
    const query = `
      query GetProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              status
              variants(first: 10) {
                edges {
                  node {
                    id
                    price
                    sku
                    inventoryQuantity
                  }
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await this.graphqlRequest<{
      products: {
        edges: Array<{ node: ShopifyProduct }>;
      };
    }>(query, { first });

    return data.products.edges.map((edge) => edge.node);
  }

  public async fetchOrders(
    first: number = 50
  ): Promise<ShopifyOrder[]> {
    const query = `
      query GetOrders($first: Int!) {
        orders(first: $first, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              id
              name
              createdAt
              displayFinancialStatus
              displayFulfillmentStatus
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `;

    const data = await this.graphqlRequest<{
      orders: {
        edges: Array<{ node: ShopifyOrder }>;
      };
    }>(query, { first });

    return data.orders.edges.map((edge) => edge.node);
  }
}
```
