import { Router } from 'express';
import { JsonStore } from '../services/json-store.js';
import { ProductService } from '../services/product-service.js';
import Joi from 'joi';
const router = Router();
const createOrderSchema = Joi.object({
    customer_email: Joi.string().email().required(),
    items: Joi.array().items(Joi.object({
        product_id: Joi.number().required(),
        variant_id: Joi.number().optional(),
        quantity: Joi.number().min(1).required()
    })).min(1).required()
});
router.post('/', async (req, res) => {
    try {
        const { error, value } = createOrderSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Invalid order data',
                details: error.details
            });
        }
        const { customer_email, items } = value;
        let total_price = 0;
        const orderItems = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const product = await ProductService.getProductById(item.product_id);
            if (!product) {
                return res.status(400).json({ error: `Product ${item.product_id} not found` });
            }
            let price = product.price;
            let variantSku;
            if (item.variant_id) {
                const variant = product.variants.find(v => v.id === item.variant_id);
                if (!variant) {
                    return res.status(400).json({ error: `Variant ${item.variant_id} not found` });
                }
                price = variant.price;
                variantSku = variant.sku;
                if (variant.inventory_qty < item.quantity) {
                    return res.status(400).json({
                        error: `Insufficient stock for variant ${item.variant_id}. Available: ${variant.inventory_qty}, Requested: ${item.quantity}`
                    });
                }
            }
            else if (product.inventory_qty < item.quantity) {
                return res.status(400).json({
                    error: `Insufficient stock for product ${item.product_id}. Available: ${product.inventory_qty}, Requested: ${item.quantity}`
                });
            }
            total_price += price * item.quantity;
            orderItems.push({
                id: i + 1,
                product_id: item.product_id,
                variant_id: item.variant_id,
                quantity: item.quantity,
                price: price,
                product_title: product.title,
                variant_sku: variantSku
            });
        }
        const order = await JsonStore.createOrder({
            customer_email,
            total_price,
            status: 'pending',
            items: orderItems
        });
        for (const item of items) {
            await ProductService.updateInventory(item.product_id, item.variant_id || null, item.quantity);
        }
        res.status(201).json(order);
    }
    catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }
        const order = await JsonStore.getOrderById(id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    }
    catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.patch('/:id/status', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body;
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }
        const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const order = await JsonStore.updateOrder(id, { status });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    }
    catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
export { router as orderRoutes };
//# sourceMappingURL=orders.js.map