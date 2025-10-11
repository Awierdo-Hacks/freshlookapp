const express = require('express');
const router = express.Router();

// Import database pool from server
let pool;
const setPool = (dbPool) => { pool = dbPool; };

// Styles
router.get('/styles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Styles ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/styles', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query('INSERT INTO Styles (name) VALUES ($1) RETURNING *', [name]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Outfits with pagination and filtering
router.get('/outfits', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const style = req.query.style;
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;

    let query = `
      SELECT o.*, s.name as style_name 
      FROM Outfits o 
      LEFT JOIN Styles s ON o.style_id = s.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (style) {
      paramCount++;
      query += ` AND s.name = $${paramCount}`;
      params.push(style);
    }

    if (minPrice) {
      paramCount++;
      query += ` AND o.price >= $${paramCount}`;
      params.push(minPrice);
    }

    if (maxPrice) {
      paramCount++;
      query += ` AND o.price <= $${paramCount}`;
      params.push(maxPrice);
    }

    query += ` ORDER BY o.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({
      data: result.rows,
      page,
      limit,
      total: result.rowCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/outfits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM Outfits WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Outfit not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/outfits', async (req, res) => {
  try {
    const { title, style_id, price, image_url } = req.body;
    const result = await pool.query(
      'INSERT INTO Outfits (title, style_id, price, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, style_id, price, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/outfits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, style_id, price, image_url } = req.body;
    const result = await pool.query(
      'UPDATE Outfits SET title = $1, style_id = $2, price = $3, image_url = $4 WHERE id = $5 RETURNING *',
      [title, style_id, price, image_url, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Outfit not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/outfits/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM Outfits WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Outfit not found' });
    }
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router, setPool };
