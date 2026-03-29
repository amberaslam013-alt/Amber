const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/auth');

/**
 * Get all wellness packages
 * GET /api/packages?category=spa&page=1&limit=10
 */
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM packages WHERE is_available = true';
    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    // Get total count
    const countResult = await pool.query(`SELECT COUNT(*) as total FROM (${query}) as count_query`, params);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results
    query += ` ORDER BY price ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      packages: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get packages error:', error);
    res.status(500).json({ error: 'Failed to fetch packages' });
  }
});

/**
 * Get single package details
 * GET /api/packages/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM packages WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.json({ package: result.rows[0] });
  } catch (error) {
    console.error('Get package detail error:', error);
    res.status(500).json({ error: 'Failed to fetch package' });
  }
});

/**
 * Create new package (Admin only)
 * POST /api/packages
 */
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, description, category, duration_days, price, inclusions, images } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO packages (name, description, category, duration_days, price, inclusions, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description, category, duration_days, price, inclusions, images]
    );

    res.status(201).json({
      message: 'Package created successfully',
      package: result.rows[0],
    });
  } catch (error) {
    console.error('Create package error:', error);
    res.status(500).json({ error: 'Failed to create package' });
  }
});

/**
 * Update package (Admin only)
 * PUT /api/packages/:id
 */
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, duration_days, price, inclusions, images, is_available } = req.body;

    const result = await pool.query(
      `UPDATE packages
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           duration_days = COALESCE($4, duration_days),
           price = COALESCE($5, price),
           inclusions = COALESCE($6, inclusions),
           images = COALESCE($7, images),
           is_available = COALESCE($8, is_available),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [name, description, category, duration_days, price, inclusions, images, is_available, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.json({
      message: 'Package updated successfully',
      package: result.rows[0],
    });
  } catch (error) {
    console.error('Update package error:', error);
    res.status(500).json({ error: 'Failed to update package' });
  }
});

/**
 * Delete package (Admin only)
 * DELETE /api/packages/:id
 */
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM packages WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.json({ message: 'Package deleted successfully' });
  } catch (error) {
    console.error('Delete package error:', error);
    res.status(500).json({ error: 'Failed to delete package' });
  }
});

module.exports = router;
