
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from root .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const IMAGES_DIR = path.join(__dirname, '../public/product-images');

async function seedDesigns() {
  const client = await pool.connect();
  try {
    console.log('Connected to database...');

    // 1. Clear existing designs
    console.log('Clearing existing designs...');
    await client.query('DELETE FROM designs');

    // 2. Read images from directory
    if (!fs.existsSync(IMAGES_DIR)) {
      console.error(`Directory not found: ${IMAGES_DIR}`);
      return;
    }

    const files = fs.readdirSync(IMAGES_DIR).filter(file => file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'));

    console.log(`Found ${files.length} images.`);

    // 3. Insert new designs
    for (const file of files) {
      const name = file.replace(/_/g, ' ').replace(/\.[^/.]+$/, '').replace(/Whisk/i, 'Design');
      const imageUrl = `/product-images/${file}`;
      const author = 'Fresh Style Community';
      const isAI = true;

      await client.query(
        'INSERT INTO designs (name, author, image_url, is_ai) VALUES ($1, $2, $3, $4)',
        [name, author, imageUrl, isAI]
      );
      console.log(`Inserted: ${name}`);
    }

    console.log('Designs reseeded successfully!');

  } catch (error) {
    console.error('Error seeding designs:', error);
  } finally {
    client.release();
    pool.end();
  }
}

seedDesigns();
