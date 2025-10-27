import express from 'express';
import { CartController } from '../controllers/cartController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All cart routes require authentication
router.use(authenticateToken);

// GET /api/cart - Get user's cart
router.get('/', CartController.getCart);

// POST /api/cart - Add item to cart
router.post('/', CartController.addToCart);

// PUT /api/cart/:id - Update cart item quantity
router.put('/:id', CartController.updateCartItem);

// DELETE /api/cart/:id - Remove item from cart
router.delete('/:id', CartController.removeFromCart);

export default router;
