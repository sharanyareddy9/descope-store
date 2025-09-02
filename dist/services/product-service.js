import { JsonStore } from './json-store.js';
export class ProductService {
    static async getAllProducts() {
        return await JsonStore.getProducts();
    }
    static async getProductById(id) {
        return await JsonStore.getProductById(id);
    }
    static async getProductByHandle(handle) {
        return await JsonStore.getProductByHandle(handle);
    }
    static async searchProducts(filters) {
        const products = await JsonStore.getProducts();
        return products.filter(product => {
            if (filters.query) {
                const query = filters.query.toLowerCase();
                const searchable = [
                    product.title,
                    product.body.replace(/<[^>]*>/g, ''), // Remove HTML tags
                    product.tags.join(' ')
                ].join(' ').toLowerCase();
                if (!searchable.includes(query))
                    return false;
            }
            if (filters.type && product.type !== filters.type) {
                return false;
            }
            if (filters.vendor && product.vendor !== filters.vendor) {
                return false;
            }
            if (filters.tags && filters.tags.length > 0) {
                const hasMatchingTag = filters.tags.some(tag => product.tags.some(productTag => productTag.toLowerCase().includes(tag.toLowerCase())));
                if (!hasMatchingTag)
                    return false;
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
    static async getProductTypes() {
        const products = await JsonStore.getProducts();
        return [...new Set(products.map(p => p.type))];
    }
    static async getVendors() {
        const products = await JsonStore.getProducts();
        return [...new Set(products.map(p => p.vendor))];
    }
    static async updateInventory(productId, variantId, quantity) {
        await JsonStore.updateProductInventory(productId, variantId, quantity);
    }
}
//# sourceMappingURL=product-service.js.map