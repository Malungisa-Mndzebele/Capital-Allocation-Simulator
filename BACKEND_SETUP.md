# Backend Setup & Testing Guide

## Issues Found & Fixed

### 1. **Missing Database Migrations** (CRITICAL)
- **Problem**: No `migrations/` folder existed in Prisma directory
- **Impact**: Render deployment fails because database schema isn't created
- **Fix**: Created initial migration file at `prisma/migrations/0_init/migration.sql`

### 2. **No Error Handling in API Endpoints** (CRITICAL)
- **Problem**: All endpoint handlers lacked try-catch blocks
- **Impact**: Database errors return 500 with no details, making debugging impossible
- **Fix**: Added comprehensive error handling to all endpoints with detailed error messages

### 3. **Missing Health Check Endpoint**
- **Problem**: No way to verify server is running
- **Fix**: Added `/api/health` endpoint for uptime monitoring

### 4. **No Graceful Shutdown**
- **Problem**: Server didn't properly close database connections
- **Fix**: Added signal handlers for SIGINT/SIGTERM

---

## How to Test Locally

### Prerequisites
```bash
# Install Node.js dependencies
cd backend
npm install

# Set up PostgreSQL (if not running)
# Option 1: Use Docker
docker run --name postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=capitalallocator -p 5432:5432 -d postgres:15

# Option 2: Use local PostgreSQL installation
# Create database: createdb capitalallocator
```

### Setup Local .env
Create `backend/.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/capitalallocator"
PORT=3000
NODE_ENV=development
```

### Run Local Backend
```bash
cd backend
npm run build        # Compile TypeScript
npm start           # Start server (will run migrations automatically)

# Or in development mode:
npm run dev         # Runs with ts-node
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:3000/api/health

# Start a new game
curl -X POST http://localhost:3000/api/game/start \
  -H "Content-Type: application/json" \
  -d '{"userId":"player1"}'

# Get game state
curl http://localhost:3000/api/game/state/player1

# Play a turn
curl -X POST http://localhost:3000/api/game/turn \
  -H "Content-Type: application/json" \
  -d '{"userId":"player1"}'

# Select a job (Level 1 action)
curl -X POST http://localhost:3000/api/game/action \
  -H "Content-Type: application/json" \
  -d '{"userId":"player1","action":"SELECT_JOB","payload":{"jobTitle":"Fast Food"}}'
```

---

## Render Deployment Checklist

### Before Deploying
1. ✅ All migrations are in `prisma/migrations/` folder
2. ✅ Error handling is in place for all endpoints
3. ✅ Environment variables are configured in Render dashboard:
   - `DATABASE_URL` - Postgres connection string
   - `PORT` - Set to 10000 (Render standard)
   - `NODE_ENV` - Set to "production"

### Render Configuration (render.yaml)
The deployment runs these commands in order:
```yaml
buildCommand: cd backend && npm install && npx prisma generate && npm run build
startCommand: cd backend && npx prisma db push && npm start
```

**Important**: `npx prisma db push` will apply migrations to the Render database.

### After Deploying
1. Test health endpoint: `https://capital-allocation-backend.onrender.com/api/health`
2. Check Render logs: View real-time server output in Render dashboard
3. Test game start: `https://capital-allocation-backend.onrender.com/api/game/start`

---

## Common Issues & Solutions

### Issue: `Error: connect ECONNREFUSED 127.0.0.1:5432`
- **Cause**: PostgreSQL not running locally
- **Solution**: Start PostgreSQL service or use Docker

### Issue: `Error: Prisma schema validation - DATABASE_URL not found`
- **Cause**: Missing `.env` file
- **Solution**: Create `backend/.env` with DATABASE_URL

### Issue: `Relation "public.GameSession" does not exist`
- **Cause**: Migrations weren't applied
- **Solution**: Run `npx prisma db push` or `npx prisma migrate deploy`

### Issue: 500 Internal Server Error on Render
- **Cause**: Database connection failed or migration didn't run
- **Solution**: 
  1. Check Render logs for exact error
  2. Verify DATABASE_URL is correct in Render environment variables
  3. Ensure migrations exist locally (they're now committed to git)

---

## API Error Response Format

All error responses now follow this format:
```json
{
  "error": "Failed to start game",
  "details": "Error message from the system"
}
```

This makes debugging much easier - you'll actually know what went wrong!

---

## Next Steps

1. **Deploy to Render**: Push changes to main branch - Render will auto-deploy
2. **Test All Endpoints**: Run through the test commands above on deployed URL
3. **Monitor Logs**: Watch Render logs for any issues during deployment
4. **Frontend Testing**: Verify frontend still connects to backend

---

## Useful Commands

```bash
# Check if migrations are applied
npx prisma migrate status

# View current database schema
npx prisma studio

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# View Prisma client errors
npx prisma generate
```
