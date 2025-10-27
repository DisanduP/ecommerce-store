import express from 'express';
import { OrderController } from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All order routes require authentication
router.use(authenticateToken);

// POST /api/orders - Create new order (checkout)
router.post('/', OrderController.createOrder);

// GET /api/orders - Get user's order history
router.get('/', OrderController.getUserOrders);

// GET /api/orders/:id - Get specific order details
router.get('/:id', OrderController.getOrderById);

export default router;
