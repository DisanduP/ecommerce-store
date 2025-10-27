import express from 'express';
import { ProductController } from '../controllers/productController';

const router = express.Router();

// GET /api/products - Get all products
router.get('/', ProductController.getAllProducts);

// GET /api/products/search - Search products with filters
router.get('/search', ProductController.searchProducts);

// GET /api/products/:id - Get product by ID
router.get('/:id', ProductController.getProductById);

export default router;
