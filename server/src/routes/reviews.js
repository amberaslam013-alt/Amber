const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { verifyToken } = require('../middleware/auth');

/**
 * Submit a review for a booking
 * POST /api/reviews
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { booking_id, rating, title, comment, images } = req.body;
    const user_id = req.user.id;

    if (!booking_id || !rating || !title) {
      return res.status(400).json({ error: 'booking_id, rating, and title are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Verify booking belongs to user
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2 AND status = $3',
      [booking_id, user_id, 'completed']
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found or not eligible for review' });
    }

    // Check if review already exists
    const existingReview = await pool.query(
      'SELECT id FROM reviews WHERE booking_id = $1',
      [booking_id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ error: 'Review already exists for this booking' });
    }

    const result = await pool.query(
      `INSERT INTO reviews
       (booking_id, user_id, rating, title, comment, images)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [booking_id, user_id, rating, title, comment, images]
    );

    res.status(201).json({
      message: 'Review submitted successfully',
      review: result.rows[0],
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

/**
 * Get review for a booking
 * GET /api/reviews/booking/:bookingId
 */
router.get('/booking/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;

    const result = await pool.query(
      'SELECT * FROM reviews WHERE booking_id = $1',
      [bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ review: result.rows[0] });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

/**
 * Get all reviews for a property
 * GET /api/reviews/property/:propertyId?page=1&limit=10
 */
router.get('/property/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get reviews for bookings with this property
    const countResult = await pool.query(
      `SELECT COUNT(DISTINCT r.id) as total FROM reviews r
       JOIN bookings b ON r.booking_id = b.id
       WHERE b.property_id = $1`,
      [propertyId]
    );
    const total = parseInt(countResult.rows[0].total);

    const result = await pool.query(
      `SELECT r.*, u.first_name, u.last_name, b.booking_ref
       FROM reviews r
       JOIN bookings b ON r.booking_id = b.id
       JOIN users u ON r.user_id = u.id
       WHERE b.property_id = $1
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [propertyId, limit, offset]
    );

    res.json({
      reviews: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get property reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

/**
 * Update a review
 * PUT /api/reviews/:id
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment, images } = req.body;
    const user_id = req.user.id;

    // Verify review belongs to user
    const reviewResult = await pool.query(
      'SELECT * FROM reviews WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const result = await pool.query(
      `UPDATE reviews
       SET rating = COALESCE($1, rating),
           title = COALESCE($2, title),
           comment = COALESCE($3, comment),
           images = COALESCE($4, images),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [rating, title, comment, images, id]
    );

    res.json({
      message: 'Review updated successfully',
      review: result.rows[0],
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

/**
 * Delete a review
 * DELETE /api/reviews/:id
 */
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Verify review belongs to user
    const reviewResult = await pool.query(
      'SELECT * FROM reviews WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

/**
 * Get property rating summary
 * GET /api/reviews/summary/:propertyId
 */
router.get('/summary/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;

    const result = await pool.query(
      `SELECT
         COUNT(*) as total_reviews,
         AVG(rating)::NUMERIC(3,2) as average_rating,
         SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
         SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
         SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
         SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
         SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
       FROM reviews r
       JOIN bookings b ON r.booking_id = b.id
       WHERE b.property_id = $1`,
      [propertyId]
    );

    const summary = result.rows[0];

    res.json({
      property_id: propertyId,
      total_reviews: parseInt(summary.total_reviews) || 0,
      average_rating: parseFloat(summary.average_rating) || 0,
      rating_breakdown: {
        five_star: parseInt(summary.five_star) || 0,
        four_star: parseInt(summary.four_star) || 0,
        three_star: parseInt(summary.three_star) || 0,
        two_star: parseInt(summary.two_star) || 0,
        one_star: parseInt(summary.one_star) || 0,
      },
    });
  } catch (error) {
    console.error('Get rating summary error:', error);
    res.status(500).json({ error: 'Failed to fetch rating summary' });
  }
});

module.exports = router;
