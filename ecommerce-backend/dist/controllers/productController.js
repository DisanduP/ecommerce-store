"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const database_1 = __importDefault(require("../models/database"));
const ProductController = {
    async getAllProducts(req, res) {
        try {
            const products = database_1.default.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
            res.status(200).json({
                success: true,
                data: products
            });
        }
        catch (error) {
            console.error('Get products error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },
    async getProductById(req, res) {
        try {
            const productId = Number.parseInt(req.params.id);
            if (!productId || productId <= 0) {
                res.status(400).json({
                    success: false,
                    error: 'Valid product ID is required'
                });
                return;
            }
            const product = database_1.default.prepare('SELECT * FROM products WHERE id = ?').get(productId);
            if (!product) {
                res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: product
            });
        }
        catch (error) {
            console.error('Get product error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },
    async searchProducts(req, res) {
        try {
            const { q, min_price, max_price, limit = 20, offset = 0 } = req.query;
            let query = 'SELECT * FROM products WHERE 1=1';
            const params = [];
            if (q) {
                query += ' AND (name LIKE ? OR description LIKE ?)';
                params.push(`%${q}%`, `%${q}%`);
            }
            if (min_price) {
                query += ' AND price >= ?';
                params.push(Number.parseFloat(min_price));
            }
            if (max_price) {
                query += ' AND price <= ?';
                params.push(Number.parseFloat(max_price));
            }
            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            params.push(Number.parseInt(limit), Number.parseInt(offset));
            const products = database_1.default.prepare(query).all(...params);
            res.status(200).json({
                success: true,
                data: products
            });
        }
        catch (error) {
            console.error('Search products error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },
};
exports.ProductController = ProductController;
