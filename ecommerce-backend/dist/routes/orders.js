'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const orderController_1 = require('../controllers/orderController');
const auth_1 = require('../middleware/auth');
const router = express_1.default.Router();
// All order routes require authentication
router.use(auth_1.authenticateToken);
// POST /api/orders - Create new order (checkout)
router.post('/', orderController_1.OrderController.createOrder);
// GET /api/orders - Get user's order history
router.get('/', orderController_1.OrderController.getUserOrders);
// GET /api/orders/:id - Get specific order details
router.get('/:id', orderController_1.OrderController.getOrderById);
exports.default = router;
