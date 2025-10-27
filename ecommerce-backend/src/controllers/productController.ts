import db from '../models/database';
import { Product } from '../models/types';

export class ProductController {
  static async getAllProducts(req: any, res: any): Promise<void> {
    try {
      const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all() as Product[];

      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getProductById(req: any, res: any): Promise<void> {
    try {
      const productId = parseInt(req.params.id);

      if (!productId || productId <= 0) {
        res.status(400).json({
          success: false,
          error: 'Valid product ID is required'
        });
        return;
      }

      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId) as Product;

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
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async searchProducts(req: any, res: any): Promise<void> {
    try {
      const { q, min_price, max_price, limit = 20, offset = 0 } = req.query;

      let query = 'SELECT * FROM products WHERE 1=1';
      const params: any[] = [];

      if (q) {
        query += ' AND (name LIKE ? OR description LIKE ?)';
        params.push(`%${q}%`, `%${q}%`);
      }

      if (min_price) {
        query += ' AND price >= ?';
        params.push(parseFloat(min_price));
      }

      if (max_price) {
        query += ' AND price <= ?';
        params.push(parseFloat(max_price));
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const products = db.prepare(query).all(...params) as Product[];

      res.status(200).json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Search products error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
