"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const database_1 = __importDefault(require("../models/database"));
const CartController = {
    async addToCart(req, res) {
        try {
            const { product_id, quantity } = req.body;
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            if (!product_id || !quantity || quantity < 1) {
                res.status(400).json({
                    success: false,
                    error: 'Valid product_id and quantity (minimum 1) are required'
                });
                return;
            }
            // Check if product exists and has stock
            const product = database_1.default.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
            if (!product) {
                res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
                return;
            }
            if (product.stock_quantity < quantity) {
                res.status(400).json({
                    success: false,
                    error: 'Insufficient stock'
                });
                return;
            }
            // Check if item already exists in cart
            const existingItem = database_1.default.prepare('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?').get(userId, product_id);
            if (existingItem) {
                // Update quantity
                const newQuantity = existingItem.quantity + quantity;
                if (product.stock_quantity < newQuantity) {
                    res.status(400).json({
                        success: false,
                        error: 'Insufficient stock for updated quantity'
                    });
                    return;
                }
                database_1.default.prepare('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newQuantity, existingItem.id);
            }
            else {
                // Add new item
                database_1.default.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)').run(userId, product_id, quantity);
            }
            // Return updated cart
            const cart = CartController.getCartData(userId);
            res.status(200).json({
                success: true,
                data: cart
            });
        }
        catch (error) {
            console.error('Add to cart error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },
    async getCart(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            const cart = CartController.getCartData(userId);
            res.status(200).json({
                success: true,
                data: cart
            });
        }
        catch (error) {
            console.error('Get cart error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },
    async updateCartItem(req, res) {
        try {
            const { quantity } = req.body;
            const userId = req.user?.userId;
            const itemId = Number.parseInt(req.params.id);
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            if (!quantity || quantity < 0) {
                res.status(400).json({
                    success: false,
                    error: 'Valid quantity (0 or greater) is required'
                });
                return;
            }
            // Check if cart item exists and belongs to user
            const cartItem = database_1.default.prepare('SELECT * FROM cart_items WHERE id = ? AND user_id = ?').get(itemId, userId);
            if (!cartItem) {
                res.status(404).json({
                    success: false,
                    error: 'Cart item not found'
                });
                return;
            }
            if (quantity === 0) {
                // Remove item
                database_1.default.prepare('DELETE FROM cart_items WHERE id = ?').run(itemId);
            }
            else {
                // Check stock
                const product = database_1.default.prepare('SELECT * FROM products WHERE id = ?').get(cartItem.product_id);
                if (product.stock_quantity < quantity) {
                    res.status(400).json({
                        success: false,
                        error: 'Insufficient stock'
                    });
                    return;
                }
                // Update quantity
                database_1.default.prepare('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(quantity, itemId);
            }
            // Return updated cart
            const cart = CartController.getCartData(userId);
            res.status(200).json({
                success: true,
                data: cart
            });
        }
        catch (error) {
            console.error('Update cart item error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },
    async removeFromCart(req, res) {
        try {
            const userId = req.user?.userId;
            const itemId = Number.parseInt(req.params.id);
            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
                return;
            }
            // Check if cart item exists and belongs to user
            const cartItem = database_1.default.prepare('SELECT * FROM cart_items WHERE id = ? AND user_id = ?').get(itemId, userId);
            if (!cartItem) {
                res.status(404).json({
                    success: false,
                    error: 'Cart item not found'
                });
                return;
            }
            // Remove item
            database_1.default.prepare('DELETE FROM cart_items WHERE id = ?').run(itemId);
            // Return updated cart
            const cart = CartController.getCartData(userId);
            res.status(200).json({
                success: true,
                data: cart
            });
        }
        catch (error) {
            console.error('Remove from cart error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },
    getCartData(userId) {
        const items = database_1.default.prepare(`
      SELECT ci.*, p.name, p.price, p.image_url, p.stock_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `).all(userId);
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return {
            items: items.map(item => ({
                id: item.id,
                user_id: item.user_id,
                product_id: item.product_id,
                quantity: item.quantity,
                created_at: item.created_at,
                updated_at: item.updated_at,
                product: {
                    id: item.product_id,
                    name: item.name,
                    price: item.price,
                    image_url: item.image_url,
                    stock_quantity: item.stock_quantity
                }
            })),
            total: totalValue
        };
    },
};
exports.CartController = CartController;
