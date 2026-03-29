# Grand Hotel Bad Pyrmont — Backend Server

RESTful API server for the Grand Hotel Bad Pyrmont booking system built with Node.js, Express, and PostgreSQL.

## Features

- **User Management**: Registration, login, profile management with JWT authentication
- **Room Booking**: Browse, filter, and book hotel rooms with real-time availability checking
- **Wellness Packages**: Listing and booking of spa, wellness, and dining packages
- **Event Booking**: Venue reservation for conferences, weddings, and corporate events
- **Payment Processing**: Stripe integration for secure card payments, bank transfer support
- **Reviews & Ratings**: Guest reviews and property ratings system
- **Admin Panel API**: Manage properties, bookings, and users
- **Secure Authentication**: JWT-based authentication with role-based access control

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Database**: PostgreSQL 14+
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, CORS, bcryptjs, Rate Limiting
- **Payments**: Stripe API
- **Email**: Nodemailer (ready for email notifications)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ running locally or remotely
- Stripe account (for payment processing)
- Gmail account (for email notifications)

### Installation

1. Install dependencies:

```bash
cd server
npm install
```

2. Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=grand_hotel_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRY=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

4. Create PostgreSQL database:

```bash
createdb grand_hotel_db
```

5. Run database migrations:

```bash
npm run migrate
```

### Development

Start the development server with auto-reload:

```bash
npm run dev
```

Server runs on `http://localhost:5000`

### Production

Start the production server:

```bash
NODE_ENV=production npm start
```

## API Documentation

### Authentication Endpoints

```
POST   /api/auth/register              Register new user
POST   /api/auth/login                 Login user
GET    /api/auth/profile               Get user profile (requires token)
PUT    /api/auth/profile               Update profile (requires token)
POST   /api/auth/change-password       Change password (requires token)
POST   /api/auth/logout                Logout (requires token)
```

### Room Endpoints

```
GET    /api/rooms                      List all rooms with filters
GET    /api/rooms/:id                  Get room details
GET    /api/rooms/:id/availability     Check room availability
POST   /api/rooms                      Create room (admin only)
PUT    /api/rooms/:id                  Update room (admin only)
DELETE /api/rooms/:id                  Delete room (admin only)
```

### Package Endpoints

```
GET    /api/packages                   List all packages
GET    /api/packages/:id               Get package details
POST   /api/packages                   Create package (admin only)
PUT    /api/packages/:id               Update package (admin only)
DELETE /api/packages/:id               Delete package (admin only)
```

### Event Endpoints

```
GET    /api/events                     List all events/venues
GET    /api/events/:id                 Get event details
GET    /api/events/:id/availability    Check event availability
POST   /api/events                     Create event (admin only)
PUT    /api/events/:id                 Update event (admin only)
DELETE /api/events/:id                 Delete event (admin only)
```

### Booking Endpoints

```
POST   /api/bookings                   Create booking (requires token)
GET    /api/bookings                   Get user's bookings (requires token)
GET    /api/bookings/:id               Get booking details (requires token)
PUT    /api/bookings/:id               Update booking (requires token)
DELETE /api/bookings/:id               Cancel booking (requires token)
GET    /api/admin/bookings             Get all bookings (admin only)
```

### Payment Endpoints

```
POST   /api/payments                   Process payment (requires token)
GET    /api/payments/:id               Get payment details (requires token)
POST   /api/payments/:id/refund        Refund payment (admin only)
GET    /api/invoices/:bookingId        Download invoice (requires token)
```

### Review Endpoints

```
POST   /api/reviews                    Submit review (requires token)
GET    /api/reviews/booking/:bookingId Get review for booking
GET    /api/reviews/property/:propertyId Get property reviews
PUT    /api/reviews/:id                Update review (requires token)
DELETE /api/reviews/:id                Delete review (requires token)
GET    /api/reviews/summary/:propertyId Get property rating summary
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Token obtained from login response and valid for 7 days (configurable).

## Database Schema

Key tables:
- `users` — User accounts and profiles
- `rooms` — Hotel rooms with amenities and pricing
- `packages` — Wellness packages (spa, dining, etc.)
- `events` — Event venues for conferences, weddings
- `bookings` — All booking reservations
- `payments` — Payment transactions
- `reviews` — Guest reviews and ratings
- `room_availability` — Cached availability for fast queries

## Error Handling

API returns standard HTTP status codes:

- `200` — Success
- `201` — Created
- `400` — Bad request
- `401` — Unauthorized
- `403` — Forbidden
- `404` — Not found
- `409` — Conflict
- `500` — Server error

Error response format:

```json
{
  "error": {
    "status": 400,
    "message": "Description of error"
  }
}
```

## Security Features

- **JWT Authentication** — Stateless token-based auth
- **Password Hashing** — bcryptjs with 10 rounds
- **Rate Limiting** — 100 requests per 15 minutes per IP
- **CORS** — Configured for frontend origin
- **Helmet** — HTTP security headers
- **SQL Injection Prevention** — Parameterized queries with pg
- **HTTPS Ready** — Works with SSL/TLS proxies

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `DB_*` — Database connection
- `JWT_SECRET` — Secret key for signing tokens
- `STRIPE_SECRET_KEY` — Stripe API key
- `CORS_ORIGIN` — Frontend URL for CORS
- `HOTEL_*` — Hotel contact information

## Development

### Run Migrations

```bash
npm run migrate
```

### Seed Database

```bash
npm run seed
```

### Test API

Use Postman, Insomnia, or curl:

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get rooms
curl http://localhost:5000/api/rooms
```

## Troubleshooting

### Database connection fails

Check PostgreSQL is running:

```bash
pg_isready -h localhost -p 5432
```

Verify credentials in `.env`

### Stripe errors

Verify `STRIPE_SECRET_KEY` is set correctly in `.env`

Use test keys from Stripe dashboard (starts with `sk_test_`)

### CORS errors

Check `CORS_ORIGIN` matches frontend URL in `.env`

Default is `http://localhost:5173` for Vite dev server

## Deployment

1. Set production environment variables
2. Run database migrations
3. Start server: `NODE_ENV=production npm start`
4. Use reverse proxy (nginx/Apache) for HTTPS
5. Set up database backups
6. Monitor logs and errors

## License

MIT

## Support

For issues or questions, refer to the main README in the project root.
