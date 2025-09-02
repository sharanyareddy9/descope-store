import { DatabaseService } from '../services/database-service.js';
import { ProductService } from '../services/product-service.js';

const descopeProducts = [
  {
    handle: 'multi-factor-tee',
    title: 'Multi-Factor Tee',
    body: '<p>Sophisticated design with layered security elements that reveal themselves under different lighting. Just like good MFA - simple on the surface, complex underneath.</p><p>Perfect for developers who appreciate elegant identity solutions.</p><p><strong>Something You Are, Something You Wear</strong></p>',
    vendor: 'Descope',
    type: 'Shirts',
    tags: 'auth, security, MFA, developer, tee',
    price: 29.99,
    compare_at_price: 34.99,
    sku: 'MFT-BASE',
    inventory_qty: 500,
    variants: [
      { sku: 'MFT-S', option1_name: 'Size', option1_value: 'Small', price: 29.99, compare_at_price: 34.99, inventory_qty: 100, weight: 200 },
      { sku: 'MFT-M', option1_name: 'Size', option1_value: 'Medium', price: 29.99, compare_at_price: 34.99, inventory_qty: 100, weight: 200 },
      { sku: 'MFT-L', option1_name: 'Size', option1_value: 'Large', price: 29.99, compare_at_price: 34.99, inventory_qty: 100, weight: 200 },
      { sku: 'MFT-XL', option1_name: 'Size', option1_value: 'XL', price: 29.99, compare_at_price: 34.99, inventory_qty: 100, weight: 200 },
      { sku: 'MFT-XXL', option1_name: 'Size', option1_value: 'XXL', price: 32.99, compare_at_price: 37.99, inventory_qty: 100, weight: 200 }
    ]
  },
  {
    handle: 'descope-mug',
    title: 'Descope Mug',
    body: '<p>Premium ceramic mug with elegant Descope logo and authentication-themed design. Perfect for your morning coffee while building secure authentication flows.</p><p>Features the Descope brand mark with subtle security-themed graphics.</p><p><strong>Authentication Made Simple</strong></p>',
    vendor: 'Descope',
    type: 'Home & Kitchen',
    tags: 'descope, mug, coffee, developer, authentication, ceramic',
    price: 24.99,
    compare_at_price: 29.99,
    sku: 'DCP-MUG-11',
    inventory_qty: 50,
    variants: [
      { sku: 'DCP-MUG-11', option1_name: 'Size', option1_value: '11oz', price: 24.99, compare_at_price: 29.99, inventory_qty: 50, weight: 400 }
    ]
  },
  {
    handle: 'descope-cap',
    title: 'Descope Cap',
    body: '<p>Premium baseball cap featuring the Descope logo in clean embroidery. Perfect for developers and security professionals who appreciate elegant identity solutions.</p><p>Structured fit with adjustable strap for comfort.</p><p><strong>Wear Your Auth</strong></p>',
    vendor: 'Descope',
    type: 'Hat',
    tags: 'descope, cap, developer, baseball-cap, embroidered, auth',
    price: 34.99,
    compare_at_price: 39.99,
    sku: 'DCP-CAP-OS',
    inventory_qty: 75,
    variants: [
      { sku: 'DCP-CAP-OS', option1_name: 'Style', option1_value: 'Classic', price: 34.99, compare_at_price: 39.99, inventory_qty: 75, weight: 150 }
    ]
  },
  {
    handle: 'descope-hoodie',
    title: 'Descope Hoodie',
    body: '<p>Cozy premium hoodie featuring the Descope logo and subtle authentication-themed design elements. Perfect for staying warm while coding secure flows.</p><p>Premium blend fabric with drawstring hood, kangaroo pocket, and ribbed cuffs.</p><p><strong>Code Secure, Stay Cozy</strong></p>',
    vendor: 'Descope',
    type: 'Clothing',
    tags: 'descope, hoodie, developer, authentication, cozy, premium',
    price: 54.99,
    compare_at_price: 64.99,
    sku: 'DCP-HD-BASE',
    inventory_qty: 250,
    variants: [
      { sku: 'DCP-HD-S', option1_name: 'Size', option1_value: 'Small', price: 54.99, compare_at_price: 64.99, inventory_qty: 50, weight: 500 },
      { sku: 'DCP-HD-M', option1_name: 'Size', option1_value: 'Medium', price: 54.99, compare_at_price: 64.99, inventory_qty: 50, weight: 500 },
      { sku: 'DCP-HD-L', option1_name: 'Size', option1_value: 'Large', price: 54.99, compare_at_price: 64.99, inventory_qty: 50, weight: 500 },
      { sku: 'DCP-HD-XL', option1_name: 'Size', option1_value: 'XL', price: 54.99, compare_at_price: 64.99, inventory_qty: 50, weight: 500 },
      { sku: 'DCP-HD-XXL', option1_name: 'Size', option1_value: 'XXL', price: 57.99, compare_at_price: 67.99, inventory_qty: 50, weight: 500 }
    ]
  }
];

async function seedDatabase() {
  try {
    console.log('Initializing database...');
    await DatabaseService.initialize();

    console.log('Seeding products...');
    
    for (const productData of descopeProducts) {
      console.log(`Creating product: ${productData.title}`);
      
      const product = await ProductService.createProduct({
        handle: productData.handle,
        title: productData.title,
        body: productData.body,
        vendor: productData.vendor,
        type: productData.type,
        tags: productData.tags,
        price: productData.price,
        compare_at_price: productData.compare_at_price,
        sku: productData.sku,
        inventory_qty: productData.inventory_qty
      });

      console.log(`Created product with ID: ${product.id}`);

      for (const variantData of productData.variants) {
        console.log(`Creating variant: ${variantData.sku}`);
        
        await ProductService.createVariant({
          product_id: product.id,
          sku: variantData.sku,
          option1_name: variantData.option1_name,
          option1_value: variantData.option1_value,
          price: variantData.price,
          compare_at_price: variantData.compare_at_price,
          inventory_qty: variantData.inventory_qty,
          weight: variantData.weight
        });
      }
    }

    console.log('Database seeded successfully!');
    console.log('Products created:');
    
    const allProducts = await ProductService.getAllProducts();
    allProducts.forEach(product => {
      console.log(`- ${product.title} (${product.variants.length} variants)`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await DatabaseService.close();
  }
}

seedDatabase();