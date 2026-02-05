
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import pg from 'pg';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Stripe from 'stripe';

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
        await pool.query(
          `UPDATE orders SET status = 'paid' WHERE stripe_payment_intent_id = $1`,
          [paymentIntent.id]
        );
      } catch (err) {
        console.error('Failed to update order status:', err);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('PaymentIntent failed:', failedPayment.id);

      // Update order status to failed
      try {
        await pool.query(
          `UPDATE orders SET status = 'payment_failed' WHERE stripe_payment_intent_id = $1`,
          [failedPayment.id]
        );
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

// Database Setup
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Run Database Migration
const initDb = async () => {
  try {
    const client = await pool.connect();
    try {
      const schemaPath = path.join(__dirname, '../database/schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      console.log('Running database migration...');
      await client.query(schema);

      // Add shipping_address column if it doesn't exist
      try {
        await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address jsonb;`);
        console.log("Migration: Check usage of shipping_address column - OK");
      } catch (colErr) {
        console.warn("Migration: Error adding shipping_address column:", colErr.message);
      }

      // Add tracking columns
      try {
        await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number text;`);
        await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_url text;`);
        await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS printful_order_id text;`);
        console.log("Migration: Check usage of tracking columns - OK");
      } catch (colErr) {
        console.warn("Migration: Error adding tracking columns:", colErr.message);
      }

      // Add Stripe payment columns
      try {
        await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;`);
        await client.query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_client_secret text;`);
        console.log("Migration: Check usage of Stripe columns - OK");
      } catch (colErr) {
        console.warn("Migration: Error adding Stripe columns:", colErr.message);
      }

      console.log('Database migration completed successfully.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

// Initialize DB on start
initDb();

// Test Database Connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('Error executing query', err.stack);
    }
    console.log('Connected to Database at:', result.rows[0].now);
  });
});

// Routes

// GET /api/health (Check if backend is running)
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      dbTime: result.rows[0].now
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
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/products (Admin only - simplified)
app.post('/api/products', async (req, res) => {
  const { id, name, description, price, base_image_url, category } = req.body;
  try {
    // Note: id is optional if using UUID generation in DB, but we'll keep it if provided
    // If id is provided, we use it. If not, we let the DB generate it (if configured).
    // Based on schema.sql, id is uuid default uuid_generate_v4().
    // But the frontend might be sending an ID.

    let query = 'INSERT INTO products (name, description, price, base_image_url, category) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    let values = [name, description, price, base_image_url, category];

    if (id) {
      query = 'INSERT INTO products (id, name, description, price, base_image_url, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
      values = [id, name, description, price, base_image_url, category];
    }

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users (Login/Register)
app.post('/api/users', async (req, res) => {
  console.log('Received login request:', req.body);
  const { id, email, name, avatar_url, is_admin } = req.body;
  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

    // Auto-admin logic
    const shouldBeAdmin = email === 'samadly728@gmail.com' || is_admin;

    if (existingUser.rows.length > 0) {
      // Update existing user
      console.log('Updating existing user:', id);
      await pool.query(
        'UPDATE users SET name = $1, avatar_url = $2, email = $3, is_admin = $4 WHERE id = $5',
        [name, avatar_url, email, shouldBeAdmin, id]
      );
    } else {
      // Create new user
      console.log('Creating new user:', id);
      await pool.query(
        'INSERT INTO users (id, email, name, avatar_url, is_admin) VALUES ($1, $2, $3, $4, $5)',
        [id, email, name, avatar_url, shouldBeAdmin]
      );

      // Send Welcome Email
      sendWelcomeEmail({ name, email }).catch(console.error);
    }

    // Return the user data so frontend has the correct role
    const updatedUser = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    console.log('Returning user data:', updatedUser.rows[0]);
    res.json(updatedUser.rows[0]);
  } catch (error) {
    console.error('Database error in /api/users:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/users
app.get('/api/admin/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/orders
app.get('/api/admin/orders', async (req, res) => {
  try {
    const ordersResult = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    const orders = ordersResult.rows;

    for (const order of orders) {
      const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
      order.items = itemsResult.rows;
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

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insert Order
    let orderId = id;
    if (orderId) {
      await client.query(
        'INSERT INTO orders (id, user_id, total_amount, shipping_address, stripe_payment_intent_id, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [orderId, user_id, total_amount, JSON.stringify(shipping_address), stripe_payment_intent_id, stripe_payment_intent_id ? 'paid' : 'pending']
      );
    } else {
      const orderRes = await client.query(
        'INSERT INTO orders (user_id, total_amount, shipping_address, stripe_payment_intent_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [user_id, total_amount, JSON.stringify(shipping_address), stripe_payment_intent_id, stripe_payment_intent_id ? 'paid' : 'pending']
      );
      orderId = orderRes.rows[0].id;
    }

    // Insert Order Items
    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, size, color, price_at_purchase) VALUES ($1, $2, $3, $4, $5, $6)',
        [
          orderId,
          item.productId,
          item.quantity,
          item.size,
          item.color,
          item.price || 29.99 // Fallback
        ]
      );
    }

    // Trigger Printful Order
    if (shipping_address) {
      console.log("Creating Printful Order...");
      try {
        const podOrder = await createPrintfulOrder({
          shippingAddress: shipping_address,
          items: items
        });

        if (podOrder && podOrder.id) {
          // Save Printful ID for tracking
          await client.query('UPDATE orders SET printful_order_id = $1 WHERE id = $2', [podOrder.id, orderId]);
        }
        console.log("Printful Order Created (or Mocked)", podOrder?.id);
      } catch (podError) {
        console.error("Printful Error:", podError);
        // Do not fail the transaction, just log it. Admin can retry manually.
      }
    }

    await client.query('COMMIT');

    // Send Confirmation Email (Async)
    // Fetch user email first
    const userRes = await client.query('SELECT * FROM users WHERE id = $1', [user_id]);
    if (userRes.rows[0]) {
      sendOrderConfirmation(userRes.rows[0], orderId, total_amount).catch(console.error);
    }

    res.status(201).json({ message: 'Order created', orderId });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// GET /api/orders/:userId
app.get('/api/orders/:userId', async (req, res) => {
  try {
    const ordersResult = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.params.userId]);
    const orders = ordersResult.rows;

    for (const order of orders) {
      const itemsResult = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [order.id]);
      order.items = itemsResult.rows;
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/designs
app.get('/api/designs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM designs ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/designs
app.post('/api/designs', async (req, res) => {
  const { name, author, image_url, is_ai } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO designs (name, author, image_url, is_ai) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, author, image_url, is_ai]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook for Printful Updates
app.post('/api/webhooks/printful', async (req, res) => {
  const { type, data } = req.body;
  console.log("Received Printful Webhook:", type);

  if (type === 'package_shipped') {
    const { order, shipment } = data;
    const printfulOrderId = order.id;
    const trackingNumber = shipment.tracking_number;
    const trackingUrl = shipment.tracking_url;

    // Update DB
    try {
      const result = await pool.query(
        `UPDATE orders 
                 SET status = 'shipped', tracking_number = $1, tracking_url = $2 
                 WHERE printful_order_id = $3 
                 RETURNING *`,
        [trackingNumber, trackingUrl, String(printfulOrderId)]
      );

      if (result.rows.length > 0) {
        const order = result.rows[0];
        // Fetch User to send email
        const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [order.user_id]);
        if (userRes.rows[0]) {
          sendOrderShipped(userRes.rows[0], order.id, trackingNumber, trackingUrl).catch(console.error);
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
});
