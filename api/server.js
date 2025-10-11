const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Pool } = require('pg');
const { router, setPool } = require('./routes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '500kb' }));

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'supersecret',
  database: process.env.POSTGRES_DB || 'catalog',
  port: 5432,
});

// Set pool for routes
setPool(pool);

// Routes
app.use('/api', router);

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'unhealthy', error: err.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

module.exports = { app, pool };
