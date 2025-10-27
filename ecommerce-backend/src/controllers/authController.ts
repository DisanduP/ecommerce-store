import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../models/database';
import { CreateUserRequest, AuthResponse, User } from '../models/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export class AuthController {
  static async register(req: any, res: any): Promise<void> {
    try {
      const { email, password, name }: CreateUserRequest = req.body;

      // Validate input
      if (!email || !password || !name) {
        res.status(400).json({
          success: false,
          error: 'Email, password, and name are required'
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters long'
        });
        return;
      }

      // Check if user already exists
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          error: 'User with this email already exists'
        });
        return;
      }

      // Hash password
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Create user
      const stmt = db.prepare(`
        INSERT INTO users (email, password_hash, name)
        VALUES (?, ?, ?)
      `);
      const result = stmt.run(email, password_hash, name);

      // Get created user
      const user = db.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(result.lastInsertRowid) as User;

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const response: AuthResponse = {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            created_at: user.created_at
          },
          token
        }
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  static async login(req: any, res: any): Promise<void> {
    try {
      const { email, password }: { email: string; password: string } = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
        return;
      }

      // Find user by email
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User;
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const response: AuthResponse = {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            created_at: user.created_at
          },
          token
        }
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
