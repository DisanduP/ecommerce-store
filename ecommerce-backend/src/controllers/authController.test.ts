import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthController } from '../controllers/authController';

// Mock the database module
jest.mock('../models/database', () => ({
  default: {
    prepare: jest.fn()
  }
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn()
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn()
}));

describe('Auth Controller', () => {
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: any;

  beforeEach(() => {
    mockRequest = {
      body: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe'
      };

      const mockHashedPassword = 'hashedPassword';
      const mockToken = 'jwtToken';
      const mockUserId = 1;

      // Mock database calls
      const { default: db } = require('../models/database');
      const mockGet = jest.fn();
      const mockRun = jest.fn();
      db.prepare.mockReturnValueOnce({ get: mockGet }); // First prepare for user check
      db.prepare.mockReturnValueOnce({ run: mockRun }); // Second prepare for insert
      db.prepare.mockReturnValueOnce({ get: () => ({ // Third prepare for user fetch
        id: mockUserId,
        email: 'test@example.com',
        name: 'John Doe',
        created_at: '2023-01-01T00:00:00.000Z'
      }) });

      mockGet.mockReturnValue(null); // User doesn't exist
      mockRun.mockReturnValue({ lastInsertRowid: mockUserId });

      // Mock bcrypt and jwt
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHashedPassword);
      (jwt.sign as jest.Mock).mockReturnValue(mockToken);

      // Act
      await AuthController.register(mockRequest, mockResponse);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUserId, email: 'test@example.com' },
        expect.any(String),
        { expiresIn: '24h' }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: {
            id: mockUserId,
            email: 'test@example.com',
            name: 'John Doe',
            created_at: '2023-01-01T00:00:00.000Z'
          },
          token: mockToken
        }
      });
    });

    it('should return error if user already exists', async () => {
      // Arrange
      mockRequest.body = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'John Doe'
      };

      const { default: db } = require('../models/database');
      const mockGet = jest.fn();
      db.prepare.mockReturnValue({ get: mockGet });
      mockGet.mockReturnValue({ id: 1, email: 'existing@example.com' }); // User exists

      // Act
      await AuthController.register(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'User with this email already exists'
      });
    });

    it('should return error for invalid input', async () => {
      // Arrange
      mockRequest.body = {
        email: 'invalid-email',
        password: '123',
        name: ''
      };

      // Act
      await AuthController.register(mockRequest, mockResponse);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email, password, and name are required'
      });
    });
  });
});
