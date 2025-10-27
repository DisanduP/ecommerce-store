import db from '../models/database';
import { Order, OrderItem, CreateOrderRequest, OrderResponse, CartItem } from '../models/types';
import { AuthRequest } from '../middleware/auth';

export class OrderController {
  static async createOrder(req: AuthRequest, res: any): Promise<void> {
    const dbConnection = db;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    try {
      const { shipping_address }: CreateOrderRequest = req.body;

      // Get user's cart items
      const cartItems = dbConnection.prepare(`
        SELECT ci.*, p.name, p.price, p.stock_quantity
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = ?
      `).all(userId) as (CartItem & { name: string; price: number; stock_quantity: number })[];

      if (cartItems.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Cart is empty'
        });
        return;
      }

      // Check stock availability
      for (const item of cartItems) {
        if (item.stock_quantity < item.quantity) {
          res.status(400).json({
            success: false,
            error: `Insufficient stock for ${item.name}`
          });
          return;
        }
      }

      // Calculate total amount
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Begin transaction
      const insertOrder = dbConnection.prepare(`
        INSERT INTO orders (user_id, total_amount, shipping_address, status)
        VALUES (?, ?, ?, 'confirmed')
      `);

      const insertOrderItem = dbConnection.prepare(`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `);

      const updateStock = dbConnection.prepare(`
        UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?
      `);

      const clearCart = dbConnection.prepare(`
        DELETE FROM cart_items WHERE user_id = ?
      `);

      // Execute transaction
      const orderResult = insertOrder.run(userId, totalAmount, shipping_address || null);
      const orderId = orderResult.lastInsertRowid;

      // Insert order items
      for (const item of cartItems) {
        insertOrderItem.run(orderId, item.product_id, item.quantity, item.price);
      }

      // Update stock quantities
      for (const item of cartItems) {
        updateStock.run(item.quantity, item.product_id);
      }

      // Clear cart
      clearCart.run(userId);

      // Get the created order with items
      const order = dbConnection.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as Order;
      const orderItems = dbConnection.prepare(`
        SELECT oi.*, p.name, p.description, p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).all(orderId) as (OrderItem & { name: string; description?: string; image_url?: string })[];

      const response: OrderResponse = {
        success: true,
        data: {
          order,
          items: orderItems.map(item => ({
            id: item.id,
            order_id: item.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            created_at: item.created_at,
            product: {
              id: item.product_id,
              name: item.name,
              description: item.description,
              price: item.price,
              image_url: item.image_url,
              stock_quantity: 0, // Not needed in order response
              created_at: ''
            }
          }))
        }
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getUserOrders(req: AuthRequest, res: any): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const orders = db.prepare(`
        SELECT o.*,
               COUNT(oi.id) as item_count,
               SUM(oi.quantity * oi.price) as calculated_total
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `).all(userId) as (Order & { item_count: number; calculated_total: number })[];

      res.status(200).json({
        success: true,
        data: orders
      });
    } catch (error) {
      console.error('Get user orders error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async getOrderById(req: AuthRequest, res: any): Promise<void> {
    try {
      const userId = req.user?.userId;
      const orderId = parseInt(req.params.id);

      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      if (!orderId || orderId <= 0) {
        res.status(400).json({
          success: false,
          error: 'Valid order ID is required'
        });
        return;
      }

      // Get order and verify ownership
      const order = db.prepare(`
        SELECT * FROM orders WHERE id = ? AND user_id = ?
      `).get(orderId, userId) as Order;

      if (!order) {
        res.status(404).json({
          success: false,
          error: 'Order not found'
        });
        return;
      }

      // Get order items
      const orderItems = db.prepare(`
        SELECT oi.*, p.name, p.description, p.image_url
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `).all(orderId) as (OrderItem & { name: string; description?: string; image_url?: string })[];

      const response: OrderResponse = {
        success: true,
        data: {
          order,
          items: orderItems.map(item => ({
            id: item.id,
            order_id: item.order_id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            created_at: item.created_at,
            product: {
              id: item.product_id,
              name: item.name,
              description: item.description,
              price: item.price,
              image_url: item.image_url,
              stock_quantity: 0,
              created_at: ''
            }
          }))
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
