import fs from 'fs/promises';
import path from 'path';
export class JsonStore {
    static productsPath = path.join(process.cwd(), 'data', 'products.json');
    static ordersPath = path.join(process.cwd(), 'data', 'orders.json');
    static async getProducts() {
        try {
            const data = await fs.readFile(this.productsPath, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error('Error reading products:', error);
            return [];
        }
    }
    static async getProductById(id) {
        const products = await this.getProducts();
        return products.find(p => p.id === id) || null;
    }
    static async getProductByHandle(handle) {
        const products = await this.getProducts();
        return products.find(p => p.handle === handle) || null;
    }
    static async getOrders() {
        try {
            const data = await fs.readFile(this.ordersPath, 'utf-8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error('Error reading orders:', error);
            return [];
        }
    }
    static async getOrderById(id) {
        const orders = await this.getOrders();
        return orders.find(o => o.id === id) || null;
    }
    static async createOrder(orderData) {
        const orders = await this.getOrders();
        const newId = Math.max(0, ...orders.map(o => o.id)) + 1;
        const now = new Date().toISOString();
        const newOrder = {
            ...orderData,
            id: newId,
            created_at: now,
            updated_at: now
        };
        orders.push(newOrder);
        await fs.writeFile(this.ordersPath, JSON.stringify(orders, null, 2));
        return newOrder;
    }
    static async updateOrder(id, updates) {
        const orders = await this.getOrders();
        const orderIndex = orders.findIndex(o => o.id === id);
        if (orderIndex === -1)
            return null;
        orders[orderIndex] = {
            ...orders[orderIndex],
            ...updates,
            updated_at: new Date().toISOString()
        };
        await fs.writeFile(this.ordersPath, JSON.stringify(orders, null, 2));
        return orders[orderIndex];
    }
    static async updateProductInventory(productId, variantId, quantity) {
        const products = await this.getProducts();
        const product = products.find(p => p.id === productId);
        if (!product)
            return;
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
//# sourceMappingURL=json-store.js.map