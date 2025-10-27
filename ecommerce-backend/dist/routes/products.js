'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const express_1 = __importDefault(require('express'));
const productController_1 = require('../controllers/productController');
const router = express_1.default.Router();
// GET /api/products - Get all products
router.get('/', productController_1.ProductController.getAllProducts);
// GET /api/products/search - Search products with filters
router.get('/search', productController_1.ProductController.searchProducts);
// GET /api/products/:id - Get product by ID
router.get('/:id', productController_1.ProductController.getProductById);
exports.default = router;
