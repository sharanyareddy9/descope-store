import fs from 'fs/promises';
import path from 'path';

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

export class JsonStore {
  private static productsPath = path.join(process.cwd(), 'data', 'products.json');
  private static ordersPath = path.join(process.cwd(), 'data', 'orders.json');

  static async getProducts(): Promise<Product[]> {
    try {
      const data = await fs.readFile(this.productsPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading products:', error);
      return [];
    }
  }

  static async getProductById(id: number): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find(p => p.id === id) || null;
  }

  static async getProductByHandle(handle: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find(p => p.handle === handle) || null;
  }

  static async getOrders(): Promise<Order[]> {
    try {
      const data = await fs.readFile(this.ordersPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading orders:', error);
      return [];
    }
  }

  static async getOrderById(id: number): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find(o => o.id === id) || null;
  }

  static async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const orders = await this.getOrders();
    const newId = Math.max(0, ...orders.map(o => o.id)) + 1;
    const now = new Date().toISOString();
    
    const newOrder: Order = {
      ...orderData,
      id: newId,
      created_at: now,
      updated_at: now
    };

    orders.push(newOrder);
    await fs.writeFile(this.ordersPath, JSON.stringify(orders, null, 2));
    return newOrder;
  }

  static async updateOrder(id: number, updates: Partial<Order>): Promise<Order | null> {
    const orders = await this.getOrders();
    const orderIndex = orders.findIndex(o => o.id === id);
    
    if (orderIndex === -1) return null;

    orders[orderIndex] = {
      ...orders[orderIndex],
      ...updates,
      updated_at: new Date().toISOString()
    };

    await fs.writeFile(this.ordersPath, JSON.stringify(orders, null, 2));
    return orders[orderIndex];
  }

  static async updateProductInventory(productId: number, variantId: number | null, quantity: number): Promise<void> {
    const products = await this.getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) return;

    if (variantId) {
      const variant = product.variants.find(v => v.id === variantId);
      if (variant) {
        variant.inventory_qty = Math.max(0, variant.inventory_qty - quantity);
      }
    }

    product.inventory_qty = Math.max(0, product.inventory_qty - quantity);
    product.updated_at = new Date().toISOString();

    await fs.writeFile(this.productsPath, JSON.stringify(products, null, 2));
  }
}