const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { verifyToken, isAdmin, isAuthenticated } = require('../middleware/auth');

/**
 * Create a new booking
 * POST /api/bookings
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { booking_type, property_id, check_in, check_out, num_guests, special_requests, total_price } = req.body;
    const user_id = req.user.id;

    if (!booking_type || !property_id || !check_in || !check_out || !num_guests) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate number of nights
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);
    const num_nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));

    if (num_nights <= 0) {
      return res.status(400).json({ error: 'Check-out date must be after check-in date' });
    }

    // Generate booking reference
    const booking_ref = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create booking
    const result = await pool.query(
      `INSERT INTO bookings
       (booking_ref, user_id, booking_type, property_id, check_in, check_out, num_guests, num_nights, total_price, status, special_requests)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', $10)
       RETURNING *`,
      [booking_ref, user_id, booking_type, property_id, check_in, check_out, num_guests, num_nights, total_price, special_requests]
    );

    res.status(201).json({
      message: 'Booking created successfully',
      booking: result.rows[0],
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

/**
 * Get user's bookings
 * GET /api/bookings
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM bookings WHERE user_id = $1',
      [user_id]
    );
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results
    const result = await pool.query(
      `SELECT * FROM bookings
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [user_id, limit, offset]
    );

    res.json({
      bookings: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

/**
 * Get single booking details
 * GET /api/bookings/:id
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const result = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND (user_id = $2 OR $3 = true)',
      [id, user_id, req.user.is_admin]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ booking: result.rows[0] });
  } catch (error) {
    console.error('Get booking detail error:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

/**
 * Update booking
 * PUT /api/bookings/:id
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { check_in, check_out, num_guests, special_requests } = req.body;
    const user_id = req.user.id;

    // Check if booking belongs to user
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // Don't allow updates for confirmed or completed bookings
    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Can only modify pending bookings' });
    }

    // Calculate new num_nights if dates changed
    let num_nights = booking.num_nights;
    if (check_in && check_out) {
      const checkInDate = new Date(check_in);
      const checkOutDate = new Date(check_out);
      num_nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    }

    const result = await pool.query(
      `UPDATE bookings
       SET check_in = COALESCE($1, check_in),
           check_out = COALESCE($2, check_out),
           num_guests = COALESCE($3, num_guests),
           num_nights = $4,
           special_requests = COALESCE($5, special_requests),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [check_in, check_out, num_guests, num_nights, special_requests, id]
    );

    res.json({
      message: 'Booking updated successfully',
      booking: result.rows[0],
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

/**
 * Cancel booking
 * DELETE /api/bookings/:id
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if booking belongs to user
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND (user_id = $2 OR $3 = true)',
      [id, user_id, req.user.is_admin]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Update booking status to cancelled instead of deleting
    const result = await pool.query(
      `UPDATE bookings
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    res.json({
      message: 'Booking cancelled successfully',
      booking: result.rows[0],
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

/**
 * Get all bookings (Admin only)
 * GET /api/admin/bookings
 */
router.get('/admin/all', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM bookings';
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` WHERE status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) as total FROM (${query}) as count_query`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get paginated results
    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      bookings: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

module.exports = router;
