module.exports = {
  // Room types
  ROOM_TYPES: {
    STANDARD: 'standard',
    DELUXE: 'deluxe',
    SUITE: 'suite',
    PENTHOUSE: 'penthouse',
  },

  // Package categories
  PACKAGE_CATEGORIES: {
    SPA: 'spa',
    WELLNESS: 'wellness',
    DINING: 'dining',
    ADVENTURE: 'adventure',
  },

  // Event types
  EVENT_TYPES: {
    CONFERENCE: 'conference',
    WEDDING: 'wedding',
    GALA: 'gala',
    CORPORATE: 'corporate',
    OTHER: 'other',
  },

  // Booking status
  BOOKING_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
  },

  // Payment status
  PAYMENT_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  },

  // Payment methods
  PAYMENT_METHODS: {
    STRIPE: 'stripe',
    BANK_TRANSFER: 'bank_transfer',
    CARD: 'card',
  },

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Validation
  PASSWORD_MIN_LENGTH: 8,
  PHONE_REGEX: /^[\d\s\-\+()]+$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // Time constants (in milliseconds)
  BOOKING_CANCELLATION_DEADLINE_HOURS: 24,
  PAYMENT_TIMEOUT_SECONDS: 3600,

  // Hotel info
  CURRENCY: process.env.CURRENCY || 'EUR',
  TAX_PERCENTAGE: parseFloat(process.env.TAX_PERCENTAGE) || 19,
};
