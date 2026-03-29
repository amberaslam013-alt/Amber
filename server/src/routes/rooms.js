const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/auth');

/**
 * Get all available rooms with filters
 * GET /api/rooms?type=deluxe&minPrice=100&maxPrice=500&capacity=2
 */
router.get('/', async (req, res) => {
  try {
    const { room_type, minPrice, maxPrice, capacity, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM rooms WHERE is_available = true';
    const params = [];
    let paramCount = 1;

    if (room_type) {
      query += ` AND room_type = $${paramCount}`;
      params.push(room_type);
      paramCount++;
    }

    if (minPrice) {
      query += ` AND price_per_night >= $${paramCount}`;
      params.push(parseFloat(minPrice));
      paramCount++;
    }

    if (maxPrice) {
      query += ` AND price_per_night <= $${paramCount}`;
      params.push(parseFloat(maxPrice));
      paramCount++;
    }

    if (capacity) {
      query += ` AND capacity >= $${paramCount}`;
      params.push(parseInt(capacity));
      paramCount++;
    }

    // Get total count
    const countResult = await pool.query(`SELECT COUNT(*) as total FROM (${query}) as count_query`, params);
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results
    query += ` ORDER BY price_per_night ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      rooms: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

/**
 * Get single room details
 * GET /api/rooms/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ room: result.rows[0] });
  } catch (error) {
    console.error('Get room detail error:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

/**
 * Check room availability for date range
 * GET /api/rooms/:id/availability?checkIn=2024-01-15&checkOut=2024-01-20
 */
router.get('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ error: 'checkIn and checkOut dates are required' });
    }

    // Check if room exists
    const roomResult = await pool.query('SELECT id FROM rooms WHERE id = $1', [id]);
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check availability
    const availResult = await pool.query(
      `SELECT COUNT(*) as booked_count
       FROM bookings
       WHERE property_id = $1
       AND booking_type = 'room'
       AND status != 'cancelled'
       AND (check_in, check_out) OVERLAPS ($2::date, $3::date)`,
      [id, checkIn, checkOut]
    );

    const isAvailable = parseInt(availResult.rows[0].booked_count) === 0;

    res.json({
      room_id: parseInt(id),
      check_in: checkIn,
      check_out: checkOut,
      is_available: isAvailable,
    });
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

/**
 * Create new room (Admin only)
 * POST /api/rooms
 */
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { room_number, room_type, capacity, price_per_night, description, amenities, images } = req.body;

    if (!room_number || !room_type || !capacity || !price_per_night) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO rooms (room_number, room_type, capacity, price_per_night, description, amenities, images)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [room_number, room_type, capacity, price_per_night, description, amenities, images]
    );

    res.status(201).json({
      message: 'Room created successfully',
      room: result.rows[0],
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

/**
 * Update room (Admin only)
 * PUT /api/rooms/:id
 */
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { room_number, room_type, capacity, price_per_night, description, amenities, images, is_available } = req.body;

    const result = await pool.query(
      `UPDATE rooms
       SET room_number = COALESCE($1, room_number),
           room_type = COALESCE($2, room_type),
           capacity = COALESCE($3, capacity),
           price_per_night = COALESCE($4, price_per_night),
           description = COALESCE($5, description),
           amenities = COALESCE($6, amenities),
           images = COALESCE($7, images),
           is_available = COALESCE($8, is_available),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [room_number, room_type, capacity, price_per_night, description, amenities, images, is_available, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({
      message: 'Room updated successfully',
      room: result.rows[0],
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ error: 'Failed to update room' });
  }
});

/**
 * Delete room (Admin only)
 * DELETE /api/rooms/:id
 */
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM rooms WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

module.exports = router;
