import { Product } from './json-store.js';
export interface SearchFilters {
    query?: string;
    type?: string;
    vendor?: string;
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
}
export declare class ProductService {
    static getAllProducts(): Promise<Product[]>;
    static getProductById(id: number): Promise<Product | null>;
    static getProductByHandle(handle: string): Promise<Product | null>;
    static searchProducts(filters: SearchFilters): Promise<Product[]>;
    static getProductTypes(): Promise<string[]>;
    static getVendors(): Promise<string[]>;
    static updateInventory(productId: number, variantId: number | null, quantity: number): Promise<void>;
}
//# sourceMappingURL=product-service.d.ts.map