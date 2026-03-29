# 🚀 Quick Start Guide - Grand Hotel Bad Pyrmont Booking Platform

Get the entire system running in 15 minutes.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Git

## Installation (5 minutes)

### 1. Install Dependencies

```bash
cd /home/user/Amber

# Backend
cd server && npm install && cd ..

# Frontend
cd client && npm install && cd ..
```

### 2. Environment Setup

```bash
# Create environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Edit server/.env (minimum required):
# DB_HOST=localhost
# DB_NAME=grand_hotel_db
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=any_random_string
```

### 3. Database Setup (2 minutes)

```bash
# Create database
createdb grand_hotel_db

# Run migrations
cd server
npm run migrate
cd ..
```

## Starting the Application (5 minutes)

Open 2-3 terminal windows:

### Terminal 1: Start Backend Server
```bash
cd server
npm run dev
```

Expected output:
```
🏨 Grand Hotel Server running on http://localhost:5000
📍 Environment: development
```

### Terminal 2: Start Frontend App
```bash
cd client
npm run dev
```

Expected output:
```
  VITE v8.0.3  ready in 150 ms
  ➜  Local:   http://localhost:5173/
```

### Terminal 3 (Optional): Start Reel Generator
```bash
cd reel-generator
npm run dev
```

Expected output:
```
  VITE v8.0.3  ready in 150 ms
  ➜  Local:   http://localhost:3000/
```

## ✅ Verify Everything Works (2 minutes)

### Check Backend
```bash
curl http://localhost:5000/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Test User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123",
    "first_name":"John",
    "last_name":"Doe"
  }'

# Should return JWT token
```

### Open in Browser

- **Frontend**: http://localhost:5173
- **Reel Generator**: http://localhost:3000

## 📝 First Steps

### 1. Register a User
- Go to http://localhost:5173
- Click "Sign Up"
- Fill in credentials
- Should redirect to home page

### 2. Browse Rooms
- Click "Rooms" in navigation
- Page loads (integration ready)

### 3. Test API
- Use the [API Documentation](#api-quick-reference) below

## 🔑 API Quick Reference

### Authentication
```bash
# Register
POST http://localhost:5000/api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}

# Login
POST http://localhost:5000/api/auth/register
{
  "email": "user@example.com",
  "password": "password123"
}
# Returns: { "token": "eyJ...", "user": {...} }
```

### Using Auth Token
```bash
# Add to all authenticated requests:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/bookings
```

### Room Management
```bash
# List rooms
GET http://localhost:5000/api/rooms

# Get room details
GET http://localhost:5000/api/rooms/1

# Check availability
GET http://localhost:5000/api/rooms/1/availability?checkIn=2024-02-01&checkOut=2024-02-05
```

### Packages & Events
```bash
# List packages
GET http://localhost:5000/api/packages

# List events
GET http://localhost:5000/api/events
```

### Bookings
```bash
# Create booking (needs token)
POST http://localhost:5000/api/bookings
{
  "booking_type": "room",
  "property_id": 1,
  "check_in": "2024-02-01",
  "check_out": "2024-02-05",
  "num_guests": 2,
  "total_price": 1000
}

# Get user bookings (needs token)
GET http://localhost:5000/api/bookings
```

## 🛠️ Development Tips

### Hot Reload
- **Backend**: Automatically restarts with nodemon
- **Frontend**: Hot updates with Vite
- **Save** a file and changes appear instantly

### Database Inspection
```bash
# Connect to database
psql grand_hotel_db

# List tables
\dt

# View users
SELECT * FROM users;

# View bookings
SELECT * FROM bookings;
```

### Check Logs
```bash
# Backend logs appear in Terminal 1
# Frontend logs appear in Terminal 2
# Check browser console (F12) for frontend errors
```

## 🔌 Adding Stripe (Optional)

1. Get test keys from https://stripe.com/test
2. Add to `server/.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   ```
3. Payment endpoints now work with test cards:
   - Card: `4242 4242 4242 4242`
   - Exp: `12/25` (any future date)
   - CVC: `123`

## ⚠️ Common Issues & Solutions

### "Port 5000/5173 already in use"
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>
```

### "PostgreSQL connection failed"
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Start PostgreSQL (macOS)
brew services start postgresql

# Start PostgreSQL (Linux)
sudo systemctl start postgresql
```

### "npm ERR! missing script"
```bash
# Make sure you're in correct directory
cd /home/user/Amber/server  # for backend
cd /home/user/Amber/client  # for frontend
```

### Database tables not found
```bash
# Rerun migrations
cd server
npm run migrate
```

## 📚 Full Documentation

- **Backend API**: See `server/README.md`
- **Frontend**: See `client/` structure
- **Full Project**: See root `README.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`

## 🎯 Next Steps

1. **Explore the Code**
   - Check `server/src/routes/` for API implementations
   - Check `client/src/` for React components

2. **Complete Page Components**
   - Room list and filtering in `client/src/pages/Rooms/`
   - Package booking in `client/src/pages/Packages/`
   - Event booking in `client/src/pages/Events/`

3. **Add Features**
   - Image uploads
   - Email notifications
   - Advanced filtering
   - Admin dashboard

4. **Deploy**
   - See `README.md` for deployment instructions

## 💡 Pro Tips

- Use VS Code REST Client or Postman for API testing
- Use `npm run seed` to add sample data (when available)
- Backend auto-reloads on code changes (nodemon)
- Frontend hot-reloads on code changes (Vite)
- Check network tab in browser dev tools to see API calls

## 🆘 Need Help?

1. Check `README.md` in relevant folder
2. Look for `.env.example` for configuration examples
3. Check API responses for error messages
4. See code comments in `src/` files
5. Check browser console (F12) for frontend errors

---

**You're all set!** 🎉

The booking platform is now running locally. Start building!

Created with ❤️ for Grand Hotel Bad Pyrmont
