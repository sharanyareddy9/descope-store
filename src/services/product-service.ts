import { JsonStore, Product } from './json-store.js';

export interface SearchFilters {
  query?: string;
  type?: string;
  vendor?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export class ProductService {
  static async getAllProducts(): Promise<Product[]> {
    return await JsonStore.getProducts();
  }

  static async getProductById(id: number): Promise<Product | null> {
    return await JsonStore.getProductById(id);
  }

  static async getProductByHandle(handle: string): Promise<Product | null> {
    return await JsonStore.getProductByHandle(handle);
  }

  static async searchProducts(filters: SearchFilters): Promise<Product[]> {
    const products = await JsonStore.getProducts();
    
    return products.filter(product => {
      if (filters.query) {
        const query = filters.query.toLowerCase();
        const searchable = [
          product.title,
          product.body.replace(/<[^>]*>/g, ''), // Remove HTML tags
          product.tags.join(' ')
        ].join(' ').toLowerCase();
        
        if (!searchable.includes(query)) return false;
      }

      if (filters.type && product.type !== filters.type) {
        return false;
      }

      if (filters.vendor && product.vendor !== filters.vendor) {
        return false;
      }

      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => 
          product.tags.some(productTag => 
            productTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
        if (!hasMatchingTag) return false;
      }

      if (filters.minPrice !== undefined && product.price < filters.minPrice) {
        return false;
      }

      if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
        return false;
      }

      if (filters.inStock && product.inventory_qty <= 0) {
        return false;
      }

      return true;
    });
  }

  static async getProductTypes(): Promise<string[]> {
    const products = await JsonStore.getProducts();
    return [...new Set(products.map(p => p.type))];
  }

  static async getVendors(): Promise<string[]> {
    const products = await JsonStore.getProducts();
    return [...new Set(products.map(p => p.vendor))];
  }

  static async updateInventory(productId: number, variantId: number | null, quantity: number): Promise<void> {
    await JsonStore.updateProductInventory(productId, variantId, quantity);
  }
}