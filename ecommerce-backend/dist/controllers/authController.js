"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../models/database"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const AuthController = {
    async register(req, res) {
        try {
            const { email, password, name } = req.body;
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
            const existingUser = database_1.default.prepare('SELECT id FROM users WHERE email = ?').get(email);
            if (existingUser) {
                res.status(409).json({
                    success: false,
                    error: 'User with this email already exists'
                });
                return;
            }
            // Hash password
            const saltRounds = 10;
            const password_hash = await bcrypt_1.default.hash(password, saltRounds);
            // Create user
            const stmt = database_1.default.prepare(`
        INSERT INTO users (email, password_hash, name)
        VALUES (?, ?, ?)
      `);
            const result = stmt.run(email, password_hash, name);
            // Get created user
            const user = database_1.default.prepare('SELECT id, email, name, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
            const response = {
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
        }
        catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },
    async login(req, res) {
        try {
            const { email, password } = req.body;
            // Validate input
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    error: 'Email and password are required'
                });
                return;
            }
            // Find user by email
            const user = database_1.default.prepare('SELECT * FROM users WHERE email = ?').get(email);
            if (!user) {
                res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
                return;
            }
            // Verify password
            const isValidPassword = await bcrypt_1.default.compare(password, user.password_hash);
            if (!isValidPassword) {
                res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
                return;
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
            const response = {
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
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },
};
exports.AuthController = AuthController;
