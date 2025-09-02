import { Router } from 'express';
import { ProductService, SearchFilters } from '../services/product-service.js';
import Joi from 'joi';

const router = Router();

const searchSchema = Joi.object({
  query: Joi.string().optional(),
  type: Joi.string().optional(),
  vendor: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  inStock: Joi.boolean().optional()
});

router.get('/', async (req, res) => {
  try {
    const { error, value } = searchSchema.validate(req.query);
    
    if (error) {
      return res.status(400).json({ 
        error: 'Invalid search parameters', 
        details: error.details 
      });
    }

    const filters: SearchFilters = value;
    const products = filters.query || filters.type || filters.vendor || filters.tags || 
                    filters.minPrice !== undefined || filters.maxPrice !== undefined || 
                    filters.inStock !== undefined
      ? await ProductService.searchProducts(filters)
      : await ProductService.getAllProducts();

    res.json({
      products,
      total: products.length,
      filters: filters
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { error, value } = searchSchema.validate(req.query);
    
    if (error) {
      return res.status(400).json({ 
        error: 'Invalid search parameters', 
        details: error.details 
      });
    }

    const filters: SearchFilters = value;
    const products = await ProductService.searchProducts(filters);

    res.json({
      products,
      total: products.length,
      filters: filters
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await ProductService.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/handle/:handle', async (req, res) => {
  try {
    const handle = req.params.handle;
    const product = await ProductService.getProductByHandle(handle);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product by handle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/types/list', async (req, res) => {
  try {
    const types = await ProductService.getProductTypes();
    res.json({ types });
  } catch (error) {
    console.error('Error fetching product types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/vendors/list', async (req, res) => {
  try {
    const vendors = await ProductService.getVendors();
    res.json({ vendors });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as productRoutes };