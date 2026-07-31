// src/services/storeAggregator.ts

import { UnifiedProduct } from '../types';
import { WalmartService } from './walmartService';
import { EbayService } from './ebayService';
import { WooCommerceService } from './woocommerceService';
// Import other platform services as needed

export class StoreAggregator {
  private walmartService?: WalmartService;
  private ebayService?: EbayService;
  private wooService?: WooCommerceService;

  constructor(config: {
    walmart?: { clientId: string; clientSecret: string };
    ebay?: { accessToken: string };
    woo?: { siteUrl: string; consumerKey: string; consumerSecret: string };
  }) {
    if (config.walmart) {
      this.walmartService = new WalmartService(config.walmart.clientId, config.walmart.clientSecret);
    }
    if (config.ebay) {
      this.ebayService = new EbayService(config.ebay.accessToken);
    }
    if (config.woo) {
      this.wooService = new WooCommerceService(config.woo.siteUrl, config.woo.consumerKey, config.woo.consumerSecret);
    }
  }

  public async fetchAllProducts(): Promise<UnifiedProduct[]> {
    const promises: Promise<UnifiedProduct[]>[] = [];

    if (this.walmartService) {
      promises.push(this.walmartService.fetchListings().catch(err => {
        console.error('Error fetching Walmart products:', err);
        return [];
      }));
    }

    if (this.ebayService) {
      promises.push(this.ebayService.fetchListings().catch(err => {
        console.error('Error fetching eBay products:', err);
        return [];
      }));
    }

    if (this.wooService) {
      promises.push(this.wooService.fetchListings().catch(err => {
        console.error('Error fetching WooCommerce products:', err);
        return [];
      }));
    }

    const results = await Promise.all(promises);
    return results.flat();
  }
}
