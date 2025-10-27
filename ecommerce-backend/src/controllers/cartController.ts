import db from '../models/database';
import { CartItem, CartItemRequest, CartResponse, Product } from '../models/types';
import { AuthRequest } from '../middleware/auth';

export class CartController {
  static async addToCart(req: AuthRequest, res: any): Promise<void> {
    try {
      const { product_id, quantity }: CartItemRequest = req.body;
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
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id) as Product;
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
      const existingItem = db.prepare('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?').get(userId, product_id) as CartItem;

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

        db.prepare('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newQuantity, existingItem.id);
      } else {
        // Add new item
        db.prepare('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)').run(userId, product_id, quantity);
      }

      // Return updated cart
      const cart = CartController.getCartData(userId);
      res.status(200).json({
        success: true,
        data: cart
      });
    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getCart(req: AuthRequest, res: any): Promise<void> {
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
    } catch (error) {
      console.error('Get cart error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async updateCartItem(req: AuthRequest, res: any): Promise<void> {
    try {
      const { quantity }: { quantity: number } = req.body;
      const userId = req.user?.userId;
      const itemId = parseInt(req.params.id);

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
      const cartItem = db.prepare('SELECT * FROM cart_items WHERE id = ? AND user_id = ?').get(itemId, userId) as CartItem;
      if (!cartItem) {
        res.status(404).json({
          success: false,
          error: 'Cart item not found'
        });
        return;
      }

      if (quantity === 0) {
        // Remove item
        db.prepare('DELETE FROM cart_items WHERE id = ?').run(itemId);
      } else {
        // Check stock
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(cartItem.product_id) as Product;
        if (product.stock_quantity < quantity) {
          res.status(400).json({
            success: false,
            error: 'Insufficient stock'
          });
          return;
        }

        // Update quantity
        db.prepare('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(quantity, itemId);
      }

      // Return updated cart
      const cart = CartController.getCartData(userId);
      res.status(200).json({
        success: true,
        data: cart
      });
    } catch (error) {
      console.error('Update cart item error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async removeFromCart(req: AuthRequest, res: any): Promise<void> {
    try {
      const userId = req.user?.userId;
      const itemId = parseInt(req.params.id);

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // Check if cart item exists and belongs to user
      const cartItem = db.prepare('SELECT * FROM cart_items WHERE id = ? AND user_id = ?').get(itemId, userId) as CartItem;
      if (!cartItem) {
        res.status(404).json({
          success: false,
          error: 'Cart item not found'
        });
        return;
      }

      // Remove item
      db.prepare('DELETE FROM cart_items WHERE id = ?').run(itemId);

      // Return updated cart
      const cart = CartController.getCartData(userId);
      res.status(200).json({
        success: true,
        data: cart
      });
    } catch (error) {
      console.error('Remove from cart error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  private static getCartData(userId: number) {
    const items = db.prepare(`
      SELECT ci.*, p.name, p.price, p.image_url, p.stock_quantity
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
      ORDER BY ci.created_at DESC
    `).all(userId) as (CartItem & { name: string; price: number; image_url?: string; stock_quantity: number })[];

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
  }
}
