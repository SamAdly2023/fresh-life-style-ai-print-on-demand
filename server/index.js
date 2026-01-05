
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    base_image_url TEXT NOT NULL,
    category TEXT CHECK(category IN ('tshirt', 'hoodie')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    total_amount REAL NOT NULL,
    status TEXT CHECK(status IN ('pending', 'processing', 'shipped', 'delivered')) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT,
    product_id TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    size TEXT NOT NULL,
    color TEXT NOT NULL,
    price_at_purchase REAL NOT NULL,
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(product_id) REFERENCES products(id)
  );
`);

console.log('Database initialized at', dbPath);

// Routes

// GET /api/products
app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products').all();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products (Admin only - simplified)
app.post('/api/products', (req, res) => {
  const { id, name, description, price, base_image_url, category } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO products (id, name, description, price, base_image_url, category) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(id, name, description, price, base_image_url, category);
    res.status(201).json({ message: 'Product created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users (Login/Register)
app.post('/api/users', (req, res) => {
  const { id, email, name, avatar_url, is_admin } = req.body;
  try {
    const existingUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (existingUser) {
      // Update existing user
      const stmt = db.prepare('UPDATE users SET name = ?, avatar_url = ?, email = ? WHERE id = ?');
      stmt.run(name, avatar_url, email, id);
    } else {
      // Create new user
      const stmt = db.prepare('INSERT INTO users (id, email, name, avatar_url, is_admin) VALUES (?, ?, ?, ?, ?)');
      stmt.run(id, email, name, avatar_url, is_admin ? 1 : 0);
    }
    res.json({ message: 'User synced' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/orders
app.post('/api/orders', (req, res) => {
  const { id, user_id, total_amount, items } = req.body;
  
  const insertOrder = db.transaction(() => {
    db.prepare('INSERT INTO orders (id, user_id, total_amount) VALUES (?, ?, ?)').run(id, user_id, total_amount);
    const insertItem = db.prepare('INSERT INTO order_items (id, order_id, product_id, quantity, size, color, price_at_purchase) VALUES (?, ?, ?, ?, ?, ?, ?)');
    
    for (const item of items) {
      insertItem.run(
        Math.random().toString(36).substr(2, 9), // Generate ID for item
        id,
        item.productId,
        item.quantity,
        item.size,
        item.color,
        item.price
      );
    }
  });

  try {
    insertOrder();
    res.status(201).json({ message: 'Order created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/:userId
app.get('/api/orders/:userId', (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.params.userId);
    for (const order of orders) {
      order.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
