"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("./models/database"));
// Clear existing products
database_1.default.prepare('DELETE FROM products').run();
console.log('Cleared existing products');
// Seed some sample products
const products = [
    {
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation and premium sound quality',
        price: 99.99,
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
        stock_quantity: 50,
        category: 'Electronics'
    },
    {
        name: 'Smartphone Case',
        description: 'Protective case for smartphones with card holder and shock absorption',
        price: 19.99,
        image_url: 'https://images.unsplash.com/photo-1601593346740-925612772716?w=500&h=500&fit=crop',
        stock_quantity: 100,
        category: 'Accessories'
    },
    {
        name: 'USB-C Cable',
        description: 'Fast charging USB-C cable, 6ft length with braided design',
        price: 12.99,
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop',
        stock_quantity: 200,
        category: 'Electronics'
    },
    {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with long battery life and precision tracking',
        price: 29.99,
        image_url: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop',
        stock_quantity: 75,
        category: 'Electronics'
    },
    {
        name: 'Laptop Stand',
        description: 'Adjustable aluminum laptop stand for better ergonomics and cooling',
        price: 49.99,
        image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop',
        stock_quantity: 30,
        category: 'Accessories'
    },
    {
        name: 'Mechanical Keyboard',
        description: 'RGB backlit mechanical keyboard with blue switches for gaming',
        price: 129.99,
        image_url: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500&h=500&fit=crop',
        stock_quantity: 25,
        category: 'Electronics'
    },
    {
        name: 'Coffee Mug',
        description: 'Ceramic coffee mug with inspirational quote, 12oz capacity',
        price: 14.99,
        image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&h=500&fit=crop',
        stock_quantity: 150,
        category: 'Home & Kitchen'
    },
    {
        name: 'Yoga Mat',
        description: 'Non-slip yoga mat with carrying strap, perfect for home workouts',
        price: 39.99,
        image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=500&fit=crop',
        stock_quantity: 40,
        category: 'Sports & Fitness'
    }
];
const stmt = database_1.default.prepare(`
  INSERT OR IGNORE INTO products (name, description, price, image_url, category, stock_quantity)
  VALUES (?, ?, ?, ?, ?, ?)
`);
for (const product of products) {
    stmt.run(product.name, product.description, product.price, product.image_url, product.category, product.stock_quantity);
}
console.log('Sample products seeded successfully!');
