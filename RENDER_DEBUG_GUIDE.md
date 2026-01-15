# How to Read Render Logs & Debug Issues

## Where to Find Render Logs

1. Go to https://dashboard.render.com
2. Click your service: **capital-allocation-backend**
3. Click the **Logs** tab
4. Watch real-time output as it deploys

---

## Expected Logs During Deployment

### Build Phase (Good Signs ✅)
```
=== Building web service: capital-allocation-backend
npm install
  ... lots of package installation output ...
npx prisma generate
✔ Prisma schema loaded
npx tsc
  ... TypeScript compilation ...
Build completed!
```

### Database Migration Phase (Good Signs ✅)
```
Starting service with 'cd backend && npx prisma db push && npm start'

prisma db push
  ... connecting to database ...
  ... applying migrations ...
✔ Migration applied successfully
```

### Server Start Phase (Good Signs ✅)
```
npm start
> node dist/server.js

Server running on port 10000
Environment: production
Database URL configured: Yes
```

---

## Common Error Logs & What They Mean

### ❌ Error: DATABASE_URL not configured
```
Error: Prisma schema validation - (get-config wasm)
Error code: P1012
error: Environment variable not found: DATABASE_URL
```
**Fix:** Add DATABASE_URL to Render environment variables

### ❌ Error: Connection refused
```
Error: connect ECONNREFUSED
```
**Fix:** Check DATABASE_URL is correct in Render dashboard

### ❌ Error: Relation does not exist
```
Error: relation "public.GameSession" does not exist
```
**Fix:** Migrations folder must exist (you've added this ✅)

### ❌ Error: Permission denied
```
error: permission denied for schema public
```
**Fix:** Database user needs CREATE permissions

---

## Testing After Deployment

### Step 1: Check Health Endpoint
```bash
curl https://capital-allocation-backend.onrender.com/api/health
```
Expected response:
```json
{"status":"ok","timestamp":"2026-01-14T18:45:22.123Z"}
```

### Step 2: Test Game Start
```bash
curl -X POST https://capital-allocation-backend.onrender.com/api/game/start \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user"}'
```
Expected response:
```json
{
  "level": "Career",
  "month": 1,
  "cash": 0,
  "netWorth": 0,
  "player": { ... }
  ... full game state
}
```

### Step 3: Open Frontend
Open your deployed frontend and try starting a game
- Should see initial game screen
- Should see welcome message
- Should be able to select a job

---

## Monitoring Tips

### What to Look For
- ✅ "Server running on port 10000"
- ✅ No ERROR lines after startup
- ✅ Incoming requests show up as:
  ```
  POST /api/game/start 200 45ms
  GET /api/game/state/user1 200 12ms
  ```

### Red Flags 🚩
- ❌ "Cannot find module" - Missing dependencies
- ❌ "ECONNREFUSED" - Database not connected
- ❌ "Schema does not exist" - Migrations didn't run
- ❌ No startup message after 30 seconds - Server crashed

---

## If Something Goes Wrong

1. **Check the Logs First**
   - Read the full error message
   - Look for the first ERROR line
   - Follow the suggested fixes above

2. **Restart the Service**
   - Render dashboard → Your service
   - Click "Restart latest deployment"
   - Wait 30 seconds

3. **Re-deploy**
   - If restart doesn't work, push to main branch
   - Render will auto-deploy (takes 2-3 minutes)

4. **Check Environment Variables**
   - Render dashboard → Environment
   - Verify DATABASE_URL exists and is correct
   - Verify PORT is set to 10000

---

## Real Example: Successful Deployment Log

```
=== Your service is being deployed
Building web service capital-allocation-backend

npm WARN deprecated <some package>
npm WARN deprecated <some package>
added 185 packages

@prisma/client@6.19.2

✔ Prisma schema loaded

npm notice 
npm notice Run `npm fund` for details

npx tsc

=== Deploying capital-allocation-backend

=== Applying migrations

prisma db push
Environment: "production"
Applying migration `0_init`
✓ 1 migration applied

=== Executing start command

npm start
> backend@1.0.0 start
> node dist/server.js

Server running on port 10000
Environment: production
Database URL configured: Yes

=== Your service is running
```

If you see something like this, you're good! 🎉

---

## Questions?

- **Still seeing 500 errors?** → Check DATABASE_URL in Render environment
- **Migrations not running?** → Verify migrations folder exists locally and is committed
- **Can't connect from frontend?** → Check frontend API_URL is pointing to correct backend URL
