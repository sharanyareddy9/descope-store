export interface Product {
    id: number;
    handle: string;
    title: string;
    body: string;
    vendor: string;
    type: string;
    tags: string[];
    price: number;
    compare_at_price?: number;
    sku: string;
    inventory_qty: number;
    image_url?: string;
    variants: ProductVariant[];
    created_at: string;
    updated_at: string;
}
export interface ProductVariant {
    id: number;
    sku: string;
    option1_name: string;
    option1_value: string;
    price: number;
    compare_at_price?: number;
    inventory_qty: number;
    weight: number;
}
export interface Order {
    id: number;
    customer_email: string;
    total_price: number;
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    items: OrderItem[];
    created_at: string;
    updated_at: string;
}
export interface OrderItem {
    id: number;
    product_id: number;
    variant_id?: number;
    quantity: number;
    price: number;
    product_title: string;
    variant_sku?: string;
}
export declare class JsonStore {
    private static productsPath;
    private static ordersPath;
    static getProducts(): Promise<Product[]>;
    static getProductById(id: number): Promise<Product | null>;
    static getProductByHandle(handle: string): Promise<Product | null>;
    static getOrders(): Promise<Order[]>;
    static getOrderById(id: number): Promise<Order | null>;
    static createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order>;
    static updateOrder(id: number, updates: Partial<Order>): Promise<Order | null>;
    static updateProductInventory(productId: number, variantId: number | null, quantity: number): Promise<void>;
}
//# sourceMappingURL=json-store.d.ts.map