'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const cors_1 = __importDefault(require('cors'));
const helmet_1 = __importDefault(require('helmet'));
const dotenv_1 = __importDefault(require('dotenv'));
const auth_1 = __importDefault(require('./routes/auth'));
const products_1 = __importDefault(require('./routes/products'));
const cart_1 = __importDefault(require('./routes/cart'));
const orders_1 = __importDefault(require('./routes/orders'));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Azure!' });
});
// API routes
app.use('/api/auth', auth_1.default);
app.use('/api/products', products_1.default);
app.use('/api/cart', cart_1.default);
app.use('/api/orders', orders_1.default);
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
  });
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
exports.default = app;
