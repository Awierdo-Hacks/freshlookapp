const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'supersecret',
  database: process.env.POSTGRES_DB || 'catalog',
  port: 5432,
});

async function runMigrations() {
  try {
    console.log('Running database migrations...');
    
    // Read and execute migration file
    const migrationSQL = fs.readFileSync(path.join(__dirname, '../db/migrations/001_init.sql'), 'utf8');
    await pool.query(migrationSQL);
    
    console.log('Migrations completed successfully');
    
    // Seed initial data
    await seedData();
    
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function seedData() {
  console.log('Seeding initial data...');
  
  // Insert styles
  const styles = ['Old money', 'Street casual', 'Minimalist', 'Boho chic', 'Business casual'];
  
  for (const style of styles) {
    await pool.query('INSERT INTO Styles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [style]);
  }
  
  // Get style IDs
  const styleResult = await pool.query('SELECT * FROM Styles');
  const styleMap = styleResult.rows.reduce((acc, style) => {
    acc[style.name] = style.id;
    return acc;
  }, {});
  
  // Insert sample outfits
  const outfits = [
    { title: 'Classic Navy Blazer Set', style: 'Old money', price: 299.99, image_url: 'https://via.placeholder.com/300x400/navy/white?text=Navy+Blazer' },
    { title: 'Cashmere Turtleneck & Trousers', style: 'Old money', price: 189.99, image_url: 'https://via.placeholder.com/300x400/beige/brown?text=Cashmere' },
    { title: 'Oversized Hoodie & Joggers', style: 'Street casual', price: 89.99, image_url: 'https://via.placeholder.com/300x400/black/white?text=Hoodie' },
    { title: 'Vintage Denim Jacket', style: 'Street casual', price: 79.99, image_url: 'https://via.placeholder.com/300x400/blue/white?text=Denim' },
    { title: 'White Button Down & Black Pants', style: 'Minimalist', price: 129.99, image_url: 'https://via.placeholder.com/300x400/white/black?text=Minimal' },
    { title: 'Flowing Maxi Dress', style: 'Boho chic', price: 159.99, image_url: 'https://via.placeholder.com/300x400/orange/white?text=Maxi' },
    { title: 'Tailored Suit Set', style: 'Business casual', price: 399.99, image_url: 'https://via.placeholder.com/300x400/gray/white?text=Suit' },
    { title: 'Polo Shirt & Chinos', style: 'Business casual', price: 119.99, image_url: 'https://via.placeholder.com/300x400/navy/white?text=Polo' }
  ];
  
  for (const outfit of outfits) {
    await pool.query(
      'INSERT INTO Outfits (title, style_id, price, image_url) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
      [outfit.title, styleMap[outfit.style], outfit.price, outfit.image_url]
    );
  }
  
  console.log('Seed data inserted successfully');
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
