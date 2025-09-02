import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';

const PORT = 3000;

// Simple JSON data store
let products = [];
let orders = [];

// Load data
try {
  const productsData = fs.readFileSync('./data/products.json', 'utf-8');
  products = JSON.parse(productsData);
  console.log(`✅ Loaded ${products.length} products`);
} catch (error) {
  console.warn('❌ Could not load products data:', error.message);
}

try {
  const ordersData = fs.readFileSync('./data/orders.json', 'utf-8');
  orders = JSON.parse(ordersData);
  console.log(`✅ Loaded ${orders.length} orders`);
} catch (error) {
  console.warn('❌ Could not load orders data:', error.message);
}

// Simple CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Add CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle OPTIONS requests
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // Health check
    if (pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
      return;
    }

    // Serve static files
    if (pathname === '/' || pathname === '/admin' || pathname === '/admin.html') {
      const filePath = path.join(process.cwd(), 'public/admin.html');
      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(404);
          res.end('Admin page not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      });
      return;
    }

    // Serve images
    if (pathname.startsWith('/images/')) {
      const fileName = pathname.replace('/images/', '');
      const imagePath = path.join(process.cwd(), 'public/images', fileName);
      
      fs.readFile(imagePath, (err, content) => {
        if (err) {
          res.writeHead(404);
          res.end('Image not found');
          return;
        }
        
        // Set appropriate content type based on file extension
        const ext = path.extname(fileName).toLowerCase();
        let contentType = 'image/png';
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        if (ext === '.gif') contentType = 'image/gif';
        if (ext === '.svg') contentType = 'image/svg+xml';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      });
      return;
    }

    // API Routes
    if (pathname.startsWith('/api/')) {
      res.setHeader('Content-Type', 'application/json');

      // Products endpoints
      if (pathname === '/api/products' && method === 'GET') {
        const query = parsedUrl.query.query;
        let filteredProducts = products;

        if (query) {
          filteredProducts = products.filter(product =>
            product.title.toLowerCase().includes(query.toLowerCase()) ||
            product.body.toLowerCase().includes(query.toLowerCase()) ||
            product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
          );
        }

        res.writeHead(200);
        res.end(JSON.stringify({
          products: filteredProducts,
          total: filteredProducts.length,
          filters: { query }
        }));
        return;
      }

      // Get product by ID
      const productIdMatch = pathname.match(/^\/api\/products\/(\d+)$/);
      if (productIdMatch && method === 'GET') {
        const productId = parseInt(productIdMatch[1]);
        const product = products.find(p => p.id === productId);
        
        if (product) {
          res.writeHead(200);
          res.end(JSON.stringify(product));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Product not found' }));
        }
        return;
      }

      // Get product by handle
      const handleMatch = pathname.match(/^\/api\/products\/handle\/(.+)$/);
      if (handleMatch && method === 'GET') {
        const handle = handleMatch[1];
        const product = products.find(p => p.handle === handle);
        
        if (product) {
          res.writeHead(200);
          res.end(JSON.stringify(product));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Product not found' }));
        }
        return;
      }

      // Create order
      if (pathname === '/api/orders' && method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const orderData = JSON.parse(body);
            const newOrder = {
              id: Math.max(0, ...orders.map(o => o.id)) + 1,
              ...orderData,
              status: 'pending',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            orders.push(newOrder);
            
            // Save to file
            fs.writeFileSync('./data/orders.json', JSON.stringify(orders, null, 2));
            
            res.writeHead(201);
            res.end(JSON.stringify(newOrder));
          } catch (error) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
          }
        });
        return;
      }

      // Get order by ID
      const orderIdMatch = pathname.match(/^\/api\/orders\/(\d+)$/);
      if (orderIdMatch && method === 'GET') {
        const orderId = parseInt(orderIdMatch[1]);
        const order = orders.find(o => o.id === orderId);
        
        if (order) {
          res.writeHead(200);
          res.end(JSON.stringify(order));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Order not found' }));
        }
        return;
      }

      // 404 for unmatched API routes
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'API endpoint not found' }));
      return;
    }

    // 404 for everything else
    res.writeHead(404);
    res.end('Page not found');
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

server.listen(PORT, () => {
  console.log('🚀 Descope Store API started successfully!');
  console.log(`📍 Server running at: http://localhost:${PORT}`);
  console.log(`🛠️  Admin interface: http://localhost:${PORT}/admin`);
  console.log(`⚡ API endpoints: http://localhost:${PORT}/api/products`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('🛡️  Ready to serve Descope authentication products!');
});