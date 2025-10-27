'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var express_1 = require('express');
var cors_1 = require('cors');
var helmet_1 = require('helmet');
var dotenv_1 = require('dotenv');
// Load environment variables
dotenv_1.default.config();
var app = (0, express_1.default)();
var PORT = process.env.PORT || 3001;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check
app.get('/health', function (req, res) {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// Simple test route
app.post('/api/auth/register', function (req, res) {
  console.log('Registration request received:', req.body);
  res.json({
    success: true,
    message: 'Registration endpoint working',
    data: req.body,
  });
});
app.listen(PORT, function () {
  console.log('Test server running on port '.concat(PORT));
});
