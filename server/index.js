
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { randomUUID } from 'crypto';

import { createPrintfulOrder } from './services/printful.js';
import { sendWelcomeEmail, sendOrderConfirmation, sendOrderShipped } from './services/email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors());

// Stripe webhook needs raw body, so we configure it before body-parser
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = JSON.parse(req.body);
    }
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent succeeded:', paymentIntent.id);

      // Update order status to paid
      try {
        db.prepare(`UPDATE orders SET status = 'paid' WHERE stripe_payment_intent_id = ?`).run(paymentIntent.id);
      } catch (err) {
        console.error('Failed to update order status:', err);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('PaymentIntent failed:', failedPayment.id);

      // Update order status to failed
      try {
        db.prepare(`UPDATE orders SET status = 'payment_failed' WHERE stripe_payment_intent_id = ?`).run(failedPayment.id);
      } catch (err) {
        console.error('Failed to update order status:', err);
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Database Setup - SQLite
// Use DATABASE_PATH env var for persistent storage on Render, fallback to local path
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'database.sqlite');
console.log('Database path:', dbPath);

// Ensure the directory exists for the database
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Run Database Migration
const initDb = () => {
  try {
    console.log('Running database migration...');

    // Create tables
    db.exec(`
      -- USERS TABLE
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        avatar_url TEXT,
        is_admin INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );

      -- PRODUCTS TABLE
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        base_image_url TEXT NOT NULL,
        category TEXT CHECK (category IN ('tshirt', 'hoodie')),
        created_at TEXT DEFAULT (datetime('now'))
      );

      -- DESIGNS TABLE
      CREATE TABLE IF NOT EXISTS designs (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        author TEXT NOT NULL,
        image_url TEXT NOT NULL,
        is_ai INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );

      -- ORDERS TABLE
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        user_id TEXT REFERENCES users(id),
        total_amount REAL NOT NULL,
        status TEXT CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'paid', 'payment_failed')) DEFAULT 'pending',
        shipping_address TEXT,
        tracking_number TEXT,
        tracking_url TEXT,
        printful_order_id TEXT,
        stripe_payment_intent_id TEXT,
        stripe_client_secret TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      -- ORDER ITEMS TABLE
      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
        product_id TEXT REFERENCES products(id),
        design_id TEXT REFERENCES designs(id),
        custom_design_url TEXT,
        quantity INTEGER NOT NULL DEFAULT 1,
        size TEXT NOT NULL,
        color TEXT NOT NULL,
        price_at_purchase REAL NOT NULL
      );
    `);

    console.log('Database migration completed successfully.');
    console.log('SQLite database location:', dbPath);
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

// Initialize DB on start
initDb();

// Routes

// GET /api/health (Check if backend is running)
app.get('/api/health', (req, res) => {
  try {
    const result = db.prepare('SELECT datetime("now") as now').get();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected (SQLite)',
      dbTime: result.now
    });
  } catch (error) {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'error',
      dbError: error.message
    });
  }
});

// GET /api/products
app.get('/api/products', (req, res) => {
  try {
    const result = db.prepare('SELECT * FROM products').all();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products (Admin only - simplified)
app.post('/api/products', (req, res) => {
  const { id, name, description, price, base_image_url, category } = req.body;
  try {
    const productId = id || randomUUID();
    const stmt = db.prepare(
      'INSERT INTO products (id, name, description, price, base_image_url, category) VALUES (?, ?, ?, ?, ?, ?)'
    );
    stmt.run(productId, name, description, price, base_image_url, category);

    const result = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users (Login/Register)
app.post('/api/users', (req, res) => {
  console.log('Received login request:', req.body);
  const { id, email, name, avatar_url, is_admin } = req.body;
  try {
    const existingUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

    // Auto-admin logic
    const shouldBeAdmin = email === 'samadly728@gmail.com' || is_admin ? 1 : 0;

    if (existingUser) {
      // Update existing user
      console.log('Updating existing user:', id);
      db.prepare(
        'UPDATE users SET name = ?, avatar_url = ?, email = ?, is_admin = ? WHERE id = ?'
      ).run(name, avatar_url, email, shouldBeAdmin, id);
    } else {
      // Create new user
      console.log('Creating new user:', id);
      db.prepare(
        'INSERT INTO users (id, email, name, avatar_url, is_admin) VALUES (?, ?, ?, ?, ?)'
      ).run(id, email, name, avatar_url, shouldBeAdmin);

      // Send Welcome Email
      sendWelcomeEmail({ name, email }).catch(console.error);
    }

    // Return the user data so frontend has the correct role
    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    console.log('Returning user data:', updatedUser);

    // Convert SQLite integer to boolean for is_admin
    res.json({
      ...updatedUser,
      is_admin: updatedUser.is_admin === 1
    });
  } catch (error) {
    console.error('Database error in /api/users:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/users
app.get('/api/admin/users', (req, res) => {
  try {
    const result = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
    res.json(result.map(u => ({ ...u, is_admin: u.is_admin === 1 })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/orders
app.get('/api/admin/orders', (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();

    for (const order of orders) {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      order.items = items;
      // Parse shipping_address JSON
      if (order.shipping_address) {
        try {
          order.shipping_address = JSON.parse(order.shipping_address);
        } catch (e) { }
      }
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/create-payment-intent
app.post('/api/create-payment-intent', async (req, res) => {
  const { amount, currency = 'usd', metadata = {} } = req.body;

  try {
    // Validate amount (Stripe expects amount in cents)
    const amountInCents = Math.round(amount * 100);

    if (amountInCents < 50) {
      return res.status(400).json({ error: 'Amount must be at least $0.50' });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: metadata,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/orders
app.post('/api/orders', async (req, res) => {
  const { id, user_id, total_amount, items, shipping_address, stripe_payment_intent_id } = req.body;

  const transaction = db.transaction(() => {
    // Insert Order
    const orderId = id || randomUUID();
    const status = stripe_payment_intent_id ? 'paid' : 'pending';

    db.prepare(
      'INSERT INTO orders (id, user_id, total_amount, shipping_address, stripe_payment_intent_id, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(orderId, user_id, total_amount, JSON.stringify(shipping_address), stripe_payment_intent_id, status);

    // Insert Order Items
    const insertItem = db.prepare(
      'INSERT INTO order_items (id, order_id, product_id, quantity, size, color, price_at_purchase) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );

    for (const item of items) {
      insertItem.run(
        randomUUID(),
        orderId,
        item.productId,
        item.quantity,
        item.size,
        item.color,
        item.price || 29.99
      );
    }

    return orderId;
  });

  try {
    const orderId = transaction();

    // Trigger Printful Order (async, outside transaction)
    if (shipping_address) {
      console.log("Creating Printful Order...");
      try {
        const podOrder = await createPrintfulOrder({
          shippingAddress: shipping_address,
          items: items
        });

        if (podOrder && podOrder.id) {
          // Save Printful ID for tracking
          db.prepare('UPDATE orders SET printful_order_id = ? WHERE id = ?').run(podOrder.id, orderId);
        }
        console.log("Printful Order Created (or Mocked)", podOrder?.id);
      } catch (podError) {
        console.error("Printful Error:", podError);
      }
    }

    // Send Confirmation Email (Async)
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(user_id);
    if (user) {
      sendOrderConfirmation(user, orderId, total_amount).catch(console.error);
    }

    res.status(201).json({ message: 'Order created', orderId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/orders/:userId
app.get('/api/orders/:userId', (req, res) => {
  try {
    const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.params.userId);

    for (const order of orders) {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      order.items = items;
      if (order.shipping_address) {
        try {
          order.shipping_address = JSON.parse(order.shipping_address);
        } catch (e) { }
      }
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/designs
app.get('/api/designs', (req, res) => {
  try {
    const result = db.prepare('SELECT * FROM designs ORDER BY created_at DESC').all();
    res.json(result.map(d => ({ ...d, is_ai: d.is_ai === 1 })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/designs
app.post('/api/designs', (req, res) => {
  const { name, author, image_url, is_ai } = req.body;
  try {
    const designId = randomUUID();
    db.prepare(
      'INSERT INTO designs (id, name, author, image_url, is_ai) VALUES (?, ?, ?, ?, ?)'
    ).run(designId, name, author, image_url, is_ai ? 1 : 0);

    const result = db.prepare('SELECT * FROM designs WHERE id = ?').get(designId);
    res.status(201).json({ ...result, is_ai: result.is_ai === 1 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/designs/:id (Admin only)
app.delete('/api/designs/:id', (req, res) => {
  const { id } = req.params;
  try {
    const design = db.prepare('SELECT * FROM designs WHERE id = ?').get(id);
    if (!design) {
      return res.status(404).json({ error: 'Design not found' });
    }

    db.prepare('DELETE FROM designs WHERE id = ?').run(id);
    console.log(`Design ${id} deleted successfully`);
    res.json({ success: true, message: 'Design deleted' });
  } catch (error) {
    console.error('Error deleting design:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook for Printful Updates
app.post('/api/webhooks/printful', (req, res) => {
  const { type, data } = req.body;
  console.log("Received Printful Webhook:", type);

  if (type === 'package_shipped') {
    const { order, shipment } = data;
    const printfulOrderId = order.id;
    const trackingNumber = shipment.tracking_number;
    const trackingUrl = shipment.tracking_url;

    // Update DB
    try {
      const result = db.prepare(
        `UPDATE orders SET status = 'shipped', tracking_number = ?, tracking_url = ? WHERE printful_order_id = ?`
      ).run(trackingNumber, trackingUrl, String(printfulOrderId));

      if (result.changes > 0) {
        const updatedOrder = db.prepare('SELECT * FROM orders WHERE printful_order_id = ?').get(String(printfulOrderId));
        if (updatedOrder) {
          const user = db.prepare('SELECT * FROM users WHERE id = ?').get(updatedOrder.user_id);
          if (user) {
            sendOrderShipped(user, updatedOrder.id, trackingNumber, trackingUrl).catch(console.error);
          }
        }
      }
    } catch (err) {
      console.error("Webhook update failed:", err);
    }
  }

  res.json({ received: true });
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
  console.log(`Database: SQLite (${dbPath})`);
});
