"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("node:path"));
const fs_1 = __importDefault(require("node:fs"));
// Use Azure App Service persistent storage in production, local data directory in development
const isProduction = process.env.NODE_ENV === 'production';
const dbDir = isProduction ? '/tmp' : path_1.default.join(__dirname, '../../data');
const dbPath = path_1.default.join(dbDir, 'ecommerce.db');
console.log(`Database path: ${dbPath}`);
console.log(`Database directory: ${dbDir}`);
console.log(`Is production: ${isProduction}`);
// Ensure directory exists
try {
    if (fs_1.default.existsSync(dbDir)) {
        console.log(`Database directory exists: ${dbDir}`);
    }
    else {
        console.log(`Creating database directory: ${dbDir}`);
        fs_1.default.mkdirSync(dbDir, { recursive: true });
    }
}
catch (error) {
    console.error(`Error creating database directory: ${error}`);
}
const db = new better_sqlite3_1.default(dbPath);
console.log('Database initialized successfully');
// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    category TEXT DEFAULT 'General',
    stock_quantity INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    shipping_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id)
  );
`);
// Seed database with sample products if empty
const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (productCount.count === 0) {
    console.log('Seeding database with sample products...');
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
    const stmt = db.prepare(`
    INSERT INTO products (name, description, price, image_url, category, stock_quantity)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
    for (const product of products) {
        stmt.run(product.name, product.description, product.price, product.image_url, product.category, product.stock_quantity);
    }
    console.log('Sample products seeded successfully!');
}
exports.default = db;
