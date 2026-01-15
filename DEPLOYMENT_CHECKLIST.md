# 🎮 Deployment Checklist

## Before You Deploy

### Step 1: Review Changes ✅
- [ ] Read `QUICK_REFERENCE.md` (2 min overview)
- [ ] Read `DEPLOYMENT_SUMMARY.md` (detailed breakdown)
- [ ] Understand what was fixed:
  - [ ] Prisma migrations added
  - [ ] Error handling added to all endpoints
  - [ ] Health check endpoint added

### Step 2: Verify Files Exist Locally
```bash
# From project root
ls backend/prisma/migrations/0_init/migration.sql
ls backend/prisma/migrations/migration_lock.toml
grep "try {" backend/src/server.ts  # Should show 4 matches
grep "/api/health" backend/src/server.ts  # Should show 1 match
```

- [ ] Migration files exist
- [ ] Error handling in place
- [ ] Health endpoint added

### Step 3: Verify Render is Ready
- [ ] Log in to https://dashboard.render.com
- [ ] Click "capital-allocation-backend" service
- [ ] Verify DATABASE_URL is set in Environment variables
- [ ] Note the service URL: https://capital-allocation-backend.onrender.com

---

## Deployment

### Step 1: Commit & Push
```bash
git add -A
git commit -m "Fix: Add Prisma migrations and error handling to backend"
git push origin main
```
- [ ] Changes committed locally
- [ ] Changes pushed to GitHub
- [ ] No git errors

### Step 2: Monitor Deployment
- [ ] Go to https://dashboard.render.com
- [ ] Click your service
- [ ] Click "Logs" tab
- [ ] Watch for:
  - [ ] `npm install` completes
  - [ ] `npx prisma db push` succeeds
  - [ ] `Server running on port 10000` appears
  - [ ] No ERROR lines after startup

**Expected time:** 2-3 minutes

### Step 3: Test Backend is Online
```bash
curl https://capital-allocation-backend.onrender.com/api/health
```
- [ ] Returns `{"status":"ok",...}`
- [ ] Status code is 200
- [ ] No connection errors

---

## Post-Deployment Testing

### Test 1: Health Check ✅
```bash
curl https://capital-allocation-backend.onrender.com/api/health
```
- [ ] Response: `{"status":"ok"}`

### Test 2: Start Game
```bash
curl -X POST https://capital-allocation-backend.onrender.com/api/game/start \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-deploy-'$(date +%s)'"}'
```
- [ ] Response: Game state JSON (not 500 error)
- [ ] Contains `"level":"Career"`
- [ ] Contains `"month":1`

### Test 3: Frontend Integration
- [ ] Open deployed frontend URL
- [ ] Click "Start Game"
- [ ] See initial game screen (not error message)
- [ ] Check browser console (no red errors)

### Test 4: Player Action
- [ ] In game, select a job (e.g., "Sales")
- [ ] Click confirm
- [ ] Game updates without errors
- [ ] See job selected in UI

### Test 5: Full Round Trip
- [ ] Click "Next Turn" multiple times
- [ ] Verify game progresses (month increments)
- [ ] No 500 errors in console
- [ ] No errors in Render logs

---

## Troubleshooting

### Issue: Still Getting 500 Errors

1. [ ] Check Render logs for the actual error
2. [ ] Verify DATABASE_URL in Render environment
3. [ ] Restart deployment (click "Restart latest deployment")
4. [ ] Re-read RENDER_DEBUG_GUIDE.md for specific error messages

### Issue: "Relation GameSession does not exist"

- [ ] Migrations didn't run
- [ ] Check that `prisma/migrations/0_init/migration.sql` exists locally
- [ ] Force Render to redeploy:
  ```bash
  git commit --allow-empty -m "Trigger redeploy"
  git push origin main
  ```

### Issue: "DATABASE_URL not found"

- [ ] Go to Render dashboard → Environment
- [ ] Verify DATABASE_URL is set and not empty
- [ ] Redeploy after fixing

### Issue: Connection Refused

- [ ] Database might be down on Render
- [ ] Try restarting the database from Render dashboard
- [ ] Contact Render support if persists

---

## Rollback (If Needed)

If something goes very wrong:

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Render will auto-deploy the reverted version
```

---

## Success! 🎉

When all tests pass:
- [ ] Health check works
- [ ] Game starts without 500 errors
- [ ] Frontend connects and plays
- [ ] No errors in console or logs
- [ ] Congratulations! Your game is live! 🚀

---

## Next Steps

- [ ] Share your deployed game with testers
- [ ] Monitor Render logs for any issues
- [ ] Gather user feedback
- [ ] Consider adding more features!

---

## Support Documents

- **Quick Overview:** QUICK_REFERENCE.md
- **Detailed Setup:** BACKEND_SETUP.md
- **Debug Guide:** RENDER_DEBUG_GUIDE.md
- **Summary:** DEPLOYMENT_SUMMARY.md

Good luck! 🚀
