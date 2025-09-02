import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import { productRoutes } from './routes/products.js';
import { orderRoutes } from './routes/orders.js';
config();
const app = express();
const PORT = process.env.PORT || 3000;
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP'
});
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json());
app.use(express.static('public'));
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
app.listen(PORT, () => {
    console.log(`Descope Store API running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Products API: http://localhost:${PORT}/api/products`);
    console.log(`Orders API: http://localhost:${PORT}/api/orders`);
});
//# sourceMappingURL=server.js.map