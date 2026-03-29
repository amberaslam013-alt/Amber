const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/auth');

/**
 * Get all event venues
 * GET /api/events?type=wedding&capacity=100&page=1&limit=10
 */
router.get('/', async (req, res) => {
  try {
    const { venue_type, minCapacity, maxPrice, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM events WHERE is_available = true';
    const params = [];
    let paramCount = 1;

    if (venue_type) {
      query += ` AND venue_type = $${paramCount}`;
      params.push(venue_type);
      paramCount++;
    }

    if (minCapacity) {
      query += ` AND capacity >= $${paramCount}`;
      params.push(parseInt(minCapacity));
      paramCount++;
    }

    if (maxPrice) {
      query += ` AND price_per_day <= $${paramCount}`;
      params.push(parseFloat(maxPrice));
      paramCount++;
    }

    // Get total count
    const countResult = await pool.query(`SELECT COUNT(*) as total FROM (${query}) as count_query`, params);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results
    query += ` ORDER BY price_per_day ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      events: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

/**
 * Get single event/venue details
 * GET /api/events/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM events WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event: result.rows[0] });
  } catch (error) {
    console.error('Get event detail error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

/**
 * Check event availability for date range
 * GET /api/events/:id/availability?checkIn=2024-01-15&checkOut=2024-01-20
 */
router.get('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: 'checkIn and checkOut dates are required' });
    }

    // Check if event exists
    const eventResult = await pool.query('SELECT id FROM events WHERE id = $1', [id]);
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check availability
    const availResult = await pool.query(
      `SELECT COUNT(*) as booked_count
       FROM bookings
       WHERE property_id = $1
       AND booking_type = 'event'
       AND status != 'cancelled'
       AND (check_in, check_out) OVERLAPS ($2::date, $3::date)`,
      [id, checkIn, checkOut]
    );

    const isAvailable = parseInt(availResult.rows[0].booked_count) === 0;

    res.json({
      event_id: parseInt(id),
      check_in: checkIn,
      check_out: checkOut,
      is_available: isAvailable,
    });
  } catch (error) {
    console.error('Check event availability error:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

/**
 * Create new event (Admin only)
 * POST /api/events
 */
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, description, venue_type, capacity, area_sqm, price_per_day, amenities, images } = req.body;

    if (!name || !venue_type || !capacity || !price_per_day) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO events (name, description, venue_type, capacity, area_sqm, price_per_day, amenities, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, description, venue_type, capacity, area_sqm, price_per_day, amenities, images]
    );

    res.status(201).json({
      message: 'Event created successfully',
      event: result.rows[0],
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

/**
 * Update event (Admin only)
 * PUT /api/events/:id
 */
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, venue_type, capacity, area_sqm, price_per_day, amenities, images, is_available } = req.body;

    const result = await pool.query(
      `UPDATE events
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           venue_type = COALESCE($3, venue_type),
           capacity = COALESCE($4, capacity),
           area_sqm = COALESCE($5, area_sqm),
           price_per_day = COALESCE($6, price_per_day),
           amenities = COALESCE($7, amenities),
           images = COALESCE($8, images),
           is_available = COALESCE($9, is_available),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [name, description, venue_type, capacity, area_sqm, price_per_day, amenities, images, is_available, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      message: 'Event updated successfully',
      event: result.rows[0],
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

/**
 * Delete event (Admin only)
 * DELETE /api/events/:id
 */
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

module.exports = router;
