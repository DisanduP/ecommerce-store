'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const cartController_1 = require('../controllers/cartController');
const auth_1 = require('../middleware/auth');
const router = express_1.default.Router();
// All cart routes require authentication
router.use(auth_1.authenticateToken);
// GET /api/cart - Get user's cart
router.get('/', cartController_1.CartController.getCart);
// POST /api/cart - Add item to cart
router.post('/', cartController_1.CartController.addToCart);
// PUT /api/cart/:id - Update cart item quantity
router.put('/:id', cartController_1.CartController.updateCartItem);
// DELETE /api/cart/:id - Remove item from cart
router.delete('/:id', cartController_1.CartController.removeFromCart);
exports.default = router;
