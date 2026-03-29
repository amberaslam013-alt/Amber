const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy');
const pool = require('../config/database');
const { verifyToken, isAdmin } = require('../middleware/auth');

/**
 * Process payment for a booking
 * POST /api/payments
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { booking_id, amount, payment_method, stripe_token } = req.body;
    const user_id = req.user.id;

    if (!booking_id || !amount) {
      return res.status(400).json({ error: 'booking_id and amount are required' });
    }

    // Verify booking exists and belongs to user
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [booking_id, user_id]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // If using Stripe, process payment
    if (payment_method === 'card' && stripe_token) {
      try {
        const charge = await stripe.charges.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: process.env.CURRENCY || 'eur',
          source: stripe_token,
          description: `Booking ${booking.booking_ref} - ${booking.num_guests} guests`,
        });

        // Create payment record
        const result = await pool.query(
          `INSERT INTO payments
           (booking_id, amount, currency, status, payment_method, stripe_payment_id)
           VALUES ($1, $2, $3, 'completed', 'stripe', $4)
           RETURNING *`,
          [booking_id, amount, process.env.CURRENCY || 'EUR', charge.id]
        );

        // Update booking status to confirmed
        await pool.query(
          'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['confirmed', booking_id]
        );

        res.status(201).json({
          message: 'Payment processed successfully',
          payment: result.rows[0],
        });
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        res.status(400).json({ error: 'Payment processing failed: ' + stripeError.message });
      }
    } else if (payment_method === 'bank_transfer') {
      // Create pending payment for bank transfer
      const result = await pool.query(
        `INSERT INTO payments
         (booking_id, amount, currency, status, payment_method)
         VALUES ($1, $2, $3, 'pending', 'bank_transfer')
         RETURNING *`,
        [booking_id, amount, process.env.CURRENCY || 'EUR']
      );

      res.status(201).json({
        message: 'Bank transfer initiated. Payment pending confirmation.',
        payment: result.rows[0],
      });
    } else {
      res.status(400).json({ error: 'Invalid payment method' });
    }
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

/**
 * Get payment details
 * GET /api/payments/:id
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const result = await pool.query(
      `SELECT p.* FROM payments p
       JOIN bookings b ON p.booking_id = b.id
       WHERE p.id = $1 AND (b.user_id = $2 OR $3 = true)`,
      [id, user_id, req.user.is_admin]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ payment: result.rows[0] });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

/**
 * Process refund for a payment
 * POST /api/payments/:id/refund
 */
router.post('/:id/refund', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Get payment
    const paymentResult = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];

    if (payment.status === 'refunded') {
      return res.status(400).json({ error: 'Payment already refunded' });
    }

    // Process refund with Stripe
    if (payment.payment_method === 'stripe' && payment.stripe_payment_id) {
      try {
        await stripe.refunds.create({
          charge: payment.stripe_payment_id,
          reason: reason || 'requested_by_customer',
        });

        // Update payment status
        const result = await pool.query(
          'UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
          ['refunded', id]
        );

        // Update booking status
        await pool.query(
          'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['cancelled', payment.booking_id]
        );

        res.json({
          message: 'Refund processed successfully',
          payment: result.rows[0],
        });
      } catch (stripeError) {
        console.error('Stripe refund error:', stripeError);
        res.status(400).json({ error: 'Refund failed: ' + stripeError.message });
      }
    } else {
      res.status(400).json({ error: 'Cannot refund this payment' });
    }
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

/**
 * Get invoices for a booking
 * GET /api/invoices/:bookingId
 */
router.get('/invoice/:bookingId', verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const user_id = req.user.id;

    // Get booking
    const bookingResult = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND (user_id = $2 OR $3 = true)',
      [bookingId, user_id, req.user.is_admin]
    );

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // Get user details
    const userResult = await pool.query(
      'SELECT email, first_name, last_name, phone FROM users WHERE id = $1',
      [booking.user_id]
    );

    // Get payment
    const paymentResult = await pool.query(
      'SELECT * FROM payments WHERE booking_id = $1',
      [bookingId]
    );

    const invoice = {
      booking_ref: booking.booking_ref,
      guest: userResult.rows[0],
      check_in: booking.check_in,
      check_out: booking.check_out,
      num_guests: booking.num_guests,
      num_nights: booking.num_nights,
      total_price: booking.total_price,
      booking_type: booking.booking_type,
      status: booking.status,
      payment: paymentResult.rows[0] || null,
      issued_at: new Date().toISOString(),
      hotel_info: {
        name: process.env.HOTEL_NAME || 'Grand Hotel Bad Pyrmont',
        address: process.env.HOTEL_ADDRESS,
        phone: process.env.HOTEL_PHONE,
        email: process.env.HOTEL_EMAIL,
      },
    };

    res.json({ invoice });
  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
});

module.exports = router;
