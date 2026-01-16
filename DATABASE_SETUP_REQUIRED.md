# Database Setup Required - ACTION NEEDED

## Current Status
✅ Backend server is running: https://capital-allocation-backend.onrender.com/api/health
❌ PostgreSQL database is not reachable
⏳ Game endpoints return 503 (Service Unavailable) until database is ready

## Problem
The `render.yaml` configuration references a database named `capital-allocation-db`, but it either:
1. Hasn't been provisioned yet in Render
2. Isn't linked to the backend service
3. Needs to be manually created

## Solution: Create Database in Render

### Option 1: Use Render Dashboard (Recommended)

1. Go to **https://dashboard.render.com**
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name:** `capital-allocation-db`
   - **Database:** `capitalallocator`
   - **User:** `admin`
   - **Region:** `Ohio` (same as backend)
   - **PostgreSQL Version:** 15 (or latest)
4. Click **"Create Database"**
5. Once created, Render will automatically:
   - Generate a connection string
   - Inject it as `DATABASE_URL` environment variable
   - Connect it to the backend service

### Option 2: Automatic (Already in render.yaml)

The `render.yaml` file already declares the database:
```yaml
databases:
  - name: capital-allocation-db
    databaseName: capitalallocator
    user: admin
```

If this is your first deployment, the database might not have been created automatically. You can:
1. Manually create it in the Render dashboard (Option 1)
2. Or redeploy with `git push` after the database exists

## What Happens After Database is Created

Once the database is available:

1. Backend's next deployment will:
   - Connect to the database successfully
   - Run migrations automatically (schema created)
   - Return 200 OK for `/api/game/state/*` endpoints

2. Frontend can then:
   - Load games at https://khasinogaming.com/world/
   - Create new games
   - Play through all levels

3. Test with:
   ```bash
   curl https://capital-allocation-backend.onrender.com/api/game/state/test_player
   ```
   Should return 200 OK with game state

## Logs Reference

From latest deployment (01/16/2026 03:16:14Z):
```
❌ All database initialization attempts failed
⚠️ Server will start but database operations will fail with 503
✅ Server fully initialized and ready to accept requests
==> Available at https://capital-allocation-backend.onrender.com
```

The server is working perfectly. Just need the database!

## Next Steps

1. Create the PostgreSQL database in Render dashboard
2. Trigger a redeploy: `git push origin main` (or use deploy hook)
3. Wait for database to initialize (~30-60 seconds)
4. Test: `curl https://capital-allocation-backend.onrender.com/api/game/state/test`
5. Play at https://khasinogaming.com/world/
