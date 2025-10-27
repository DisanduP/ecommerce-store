'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const globals_1 = require('@jest/globals');
const bcrypt_1 = __importDefault(require('bcrypt'));
const jsonwebtoken_1 = __importDefault(require('jsonwebtoken'));
const authController_1 = require('../controllers/authController');
// Mock the database module
jest.mock('../models/database', () => ({
  default: {
    prepare: jest.fn(),
  },
}));
// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));
// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));
(0, globals_1.describe)('Auth Controller', () => {
  let mockRequest;
  let mockResponse;
  let mockNext;
  (0, globals_1.beforeEach)(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });
  (0, globals_1.afterEach)(() => {
    jest.clearAllMocks();
  });
  (0, globals_1.describe)('register', () => {
    (0, globals_1.it)('should register a new user successfully', async () => {
      // Arrange
      mockRequest.body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
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
      db.prepare.mockReturnValueOnce({
        get: () => ({
          id: mockUserId,
          email: 'test@example.com',
          name: 'John Doe',
          created_at: '2023-01-01T00:00:00.000Z',
        }),
      });
      mockGet.mockReturnValue(null); // User doesn't exist
      mockRun.mockReturnValue({ lastInsertRowid: mockUserId });
      // Mock bcrypt and jwt
      bcrypt_1.default.hash.mockResolvedValue(mockHashedPassword);
      jsonwebtoken_1.default.sign.mockReturnValue(mockToken);
      // Act
      await authController_1.AuthController.register(mockRequest, mockResponse);
      // Assert
      (0, globals_1.expect)(bcrypt_1.default.hash).toHaveBeenCalledWith('password123', 10);
      (0, globals_1.expect)(jsonwebtoken_1.default.sign).toHaveBeenCalledWith(
        { userId: mockUserId, email: 'test@example.com' },
        globals_1.expect.any(String),
        { expiresIn: '24h' },
      );
      (0, globals_1.expect)(mockResponse.status).toHaveBeenCalledWith(201);
      (0, globals_1.expect)(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          user: {
            id: mockUserId,
            email: 'test@example.com',
            name: 'John Doe',
            created_at: '2023-01-01T00:00:00.000Z',
          },
          token: mockToken,
        },
      });
    });
    (0, globals_1.it)('should return error if user already exists', async () => {
      // Arrange
      mockRequest.body = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'John Doe',
      };
      const { default: db } = require('../models/database');
      const mockGet = jest.fn();
      db.prepare.mockReturnValue({ get: mockGet });
      mockGet.mockReturnValue({ id: 1, email: 'existing@example.com' }); // User exists
      // Act
      await authController_1.AuthController.register(mockRequest, mockResponse);
      // Assert
      (0, globals_1.expect)(mockResponse.status).toHaveBeenCalledWith(409);
      (0, globals_1.expect)(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'User with this email already exists',
      });
    });
    (0, globals_1.it)('should return error for invalid input', async () => {
      // Arrange
      mockRequest.body = {
        email: 'invalid-email',
        password: '123',
        name: '',
      };
      // Act
      await authController_1.AuthController.register(mockRequest, mockResponse);
      // Assert
      (0, globals_1.expect)(mockResponse.status).toHaveBeenCalledWith(400);
      (0, globals_1.expect)(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: 'Email, password, and name are required',
      });
    });
  });
});
