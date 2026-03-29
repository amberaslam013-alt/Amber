# Grand Hotel Bad Pyrmont — Complete Booking Platform

A full-stack hotel reservation system for Grand Hotel Bad Pyrmont, featuring an Instagram Reel generator, luxury room bookings, wellness packages, and event venue reservations.

## 📁 Project Structure

This is a monorepo containing:

- **reel-generator/** - Instagram Reel video generator (Vite + Canvas + FFmpeg.wasm)
- **server/** - Backend API (Node.js + Express + PostgreSQL)
- **client/** - Frontend application (React + Vite)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Stripe account (for payments)

### Installation & Setup

1. **Clone and install dependencies:**

```bash
cd /home/user/Amber

# Install backend
cd server && npm install
cd ..

# Install frontend
cd client && npm install
cd ..

# Install reel generator dependencies (already done)
cd reel-generator && npm install
cd ..
```

2. **Configure environment variables:**

```bash
# Server
cp server/.env.example server/.env
# Edit server/.env with your database and Stripe credentials

# Client
cp client/.env.example client/.env
# Edit client/.env with API URL
```

3. **Create PostgreSQL database:**

```bash
createdb grand_hotel_db
```

4. **Run database migrations:**

```bash
cd server && npm run migrate
cd ..
```

5. **Start all services:**

```bash
# Terminal 1: Backend (port 5000)
cd server && npm run dev

# Terminal 2: Frontend (port 5173)
cd client && npm run dev

# Terminal 3: Reel Generator (port 3000, optional)
cd reel-generator && npm run dev
```

## 🏗️ Architecture

### Backend (server/)

RESTful API built with Express.js and PostgreSQL:

- **Authentication**: JWT-based with role-based access control
- **Databases**: User accounts, rooms, packages, events, bookings, payments, reviews
- **Features**:
  - User registration and login
  - Room availability checking
  - Booking management (create, update, cancel)
  - Stripe payment processing
  - Guest reviews and ratings
  - Admin management endpoints

**Key Routes:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/rooms` - List rooms with filters
- `GET /api/packages` - List wellness packages
- `GET /api/events` - List event venues
- `POST /api/bookings` - Create booking
- `POST /api/payments` - Process payment

See [server/README.md](server/README.md) for full API documentation.

### Frontend (client/)

React single-page application with Vite:

- **Authentication**: JWT token management with context
- **Pages**:
  - Home
  - Room listings and details
  - Wellness packages
  - Event venues
  - User authentication (login/register)
  - User dashboard
  - Booking management
- **Components**:
  - Navigation bar
  - Footer
  - Booking cards
  - Forms and filters
- **Styling**: CSS with design system and responsive layout

### Reel Generator (reel-generator/)

Interactive Instagram Reel video generator:

- **Technology**: HTML5 Canvas + FFmpeg.wasm
- **Features**:
  - Real-time preview of 10-second reel
  - Animated gradients and text overlays
  - MP4 video export
  - Cinematic transitions
  - Customizable via config.js

See [reel-generator/README.md](reel-generator/README.reel.md) for details.

## 📊 Database Schema

Key tables:

- **users** - User accounts with authentication
- **rooms** - Hotel rooms with amenities and pricing
- **packages** - Wellness packages (spa, dining, etc.)
- **events** - Event venues for conferences, weddings
- **bookings** - All reservations
- **payments** - Payment transactions with Stripe
- **reviews** - Guest ratings and feedback
- **room_availability** - Cached availability for fast queries

## 🔐 Security

- **Authentication**: JWT tokens (7-day expiry)
- **Password**: bcryptjs with 10 rounds
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend origin
- **Helmet**: HTTP security headers
- **SQL Injection**: Parameterized queries with pg library
- **Payment**: Stripe PCI-compliant processing

## 💳 Payment Integration

Uses Stripe for secure payment processing:

- Card payments via Stripe API
- Bank transfer support
- Refund handling
- Invoice generation
- Payment status tracking

Configure Stripe credentials in `server/.env`:

```env
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

## 🎨 Design System

Color palette inspired by luxury hotel branding:

- **Primary**: Gold (#B8924A)
- **Light**: Cream (#FAF6EF)
- **Dark**: Deep Brown (#1A1712)
- **Accent**: Stone, Sage, Muted

Responsive design with mobile-first approach.

## 📱 Responsive Design

- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

All pages and components are fully responsive.

## 🔄 Development Workflow

### Making Changes

1. **Backend Changes**: Edit files in `server/src/`
2. **Frontend Changes**: Edit files in `client/src/`
3. **Database Changes**: Update `server/src/migrations/schema.sql`

### Running Tests

```bash
# Backend tests (when added)
cd server && npm test

# Frontend tests (when added)
cd client && npm test
```

### Building for Production

```bash
# Backend (no build needed, runs directly)
cd server && NODE_ENV=production npm start

# Frontend
cd client && npm run build

# Reel Generator
cd reel-generator && npm run build
```

## 📝 API Documentation

Full API reference available at [server/README.md](server/README.md)

### Authentication Example

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","first_name":"John","last_name":"Doe"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get rooms (no auth needed)
curl http://localhost:5000/api/rooms

# Get bookings (requires token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/bookings
```

## 🚀 Deployment

### Local Development

Services run on:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`
- Reel Generator: `http://localhost:3000`

### Production Deployment

1. Set environment variables
2. Run database migrations
3. Build frontend: `npm run build`
4. Start backend: `NODE_ENV=production npm start`
5. Serve frontend dist files with nginx/Apache
6. Use reverse proxy for HTTPS
7. Set up backups and monitoring

## 📦 Dependencies

**Backend:**
- express (web framework)
- pg (PostgreSQL driver)
- jsonwebtoken (authentication)
- bcryptjs (password hashing)
- stripe (payment processing)
- cors (cross-origin requests)
- helmet (security headers)

**Frontend:**
- react (UI library)
- react-router-dom (routing)
- axios (HTTP client)
- stripe (payment UI)
- date-fns (date utilities)

**Reel Generator:**
- @ffmpeg/ffmpeg (video encoding)
- canvas (image rendering)

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Verify credentials in server/.env
```

### API Not Responding

```bash
# Check backend is running on port 5000
curl http://localhost:5000/health

# Check CORS_ORIGIN matches frontend URL
```

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📞 Support

For issues or questions:
1. Check the README files in each folder
2. Review API documentation in `server/README.md`
3. Check environment configuration in `.env.example` files

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] Infrastructure setup
- [x] API endpoints
- [x] React frontend skeleton
- [ ] Complete room booking flow
- [ ] Complete package booking flow
- [ ] Complete event booking flow

### Phase 2
- [ ] Payment integration testing
- [ ] Email notifications
- [ ] Advanced admin panel
- [ ] Analytics dashboard

### Phase 3
- [ ] Mobile app (React Native)
- [ ] Internationalization (i18n)
- [ ] Performance optimization
- [ ] SEO enhancement

---

**Grand Hotel Bad Pyrmont** — Luxury Wellness Resort Booking Platform

Built with ❤️ for the ultimate guest experience.
