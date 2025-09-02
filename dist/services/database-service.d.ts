import sqlite3 from 'sqlite3';
export interface Product {
    id: number;
    handle: string;
    title: string;
    body: string;
    vendor: string;
    type: string;
    tags: string;
    price: number;
    compare_at_price?: number;
    sku: string;
    inventory_qty: number;
    image_url?: string;
    created_at: string;
    updated_at: string;
}
export interface ProductVariant {
    id: number;
    product_id: number;
    sku: string;
    option1_name: string;
    option1_value: string;
    price: number;
    compare_at_price?: number;
    inventory_qty: number;
    weight: number;
    created_at: string;
    updated_at: string;
}
export interface Order {
    id: number;
    customer_email: string;
    total_price: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    created_at: string;
    updated_at: string;
}
export interface OrderItem {
    id: number;
    order_id: number;
    product_id: number;
    variant_id?: number;
    quantity: number;
    price: number;
    created_at: string;
}
export declare class DatabaseService {
    private static db;
    static initialize(): Promise<void>;
    private static createTables;
    static run(query: string, params?: any[]): Promise<sqlite3.RunResult>;
    static get<T>(query: string, params?: any[]): Promise<T | undefined>;
    static all<T>(query: string, params?: any[]): Promise<T[]>;
    static close(): Promise<void>;
}
//# sourceMappingURL=database-service.d.ts.map