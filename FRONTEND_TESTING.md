# Frontend Testing Guide

## Current Status: RUNNING ✅

**Frontend Dev Server**: http://localhost:5173/world/
**Backend Local**: http://localhost:3000 (set up locally if testing)
**Backend Live**: https://capital-allocation-backend.onrender.com

---

## How to Test the Frontend

### 1. Visual Inspection
- [ ] Page loads without errors
- [ ] UI is responsive and not broken
- [ ] Styling is applied (Tailwind CSS working)
- [ ] React components render correctly

### 2. Open Developer Console
- Press `F12` or `Ctrl+Shift+I`
- Go to **Console** tab
- Look for any red error messages
- Check **Network** tab for API calls

### 3. Test Game Start
- Click the "Start Game" button (or equivalent)
- Expected: Game initializes without errors
- Check console for API calls to `/api/game/start`

### 4. Test Player Actions
- Select a job (if UI allows)
- Click "Next Turn" or similar button
- Verify game state updates

### 5. Watch for These Errors

**❌ CORS Errors**:
```
Access to XMLHttpRequest blocked by CORS policy
```
→ Backend doesn't have CORS enabled (but we added it!)

**❌ 500 Errors**:
```
POST /api/game/start 500 
```
→ Backend crashed (shouldn't happen with our fixes!)

**❌ Network Errors**:
```
net::ERR_CONNECTION_REFUSED
```
→ Backend not running

---

## Testing Checklist

### Frontend UI Tests
- [ ] Page loads (no blank screen)
- [ ] Game title visible
- [ ] Buttons are clickable
- [ ] Text is readable
- [ ] No layout breaks

### API Connectivity Tests
- [ ] Console shows no CORS errors
- [ ] Network tab shows requests succeeding
- [ ] Responses have 200-201 status codes
- [ ] No 500 or 404 errors

### Gameplay Tests
- [ ] Can start a new game
- [ ] Game displays initial state
- [ ] Can interact with UI
- [ ] Game responds to actions

---

## If Frontend Won't Connect to Backend

### Local Testing
1. Ensure backend is running: `npm run dev` in `/backend`
2. Check backend is on `http://localhost:3000`
3. Frontend should auto-connect (it's configured to use localhost in dev mode)

### Testing Against Live Backend
1. The frontend `src/api/client.ts` automatically detects:
   - **Dev mode**: Uses `http://localhost:3000`
   - **Production**: Uses `https://capital-allocation-backend.onrender.com`

2. To force live backend even in dev mode:
   - Open browser console
   - Type: `localStorage.setItem('useRemote', 'true')`
   - Or edit `src/api/client.ts` to change API_URL

---

## Real-Time Debugging

### Check Network Requests
1. Open DevTools (F12)
2. Go to **Network** tab
3. Click a button that makes an API call
4. Look for:
   - `game/start` - Starting game
   - `game/state` - Getting game state
   - `game/action` - Player actions
   - `game/turn` - Advancing turn

### View API Response
Click on any request → **Response** tab → See actual data

### View Request Details
Click on any request → **Headers** tab → See full request info

---

## Expected Behavior After Backend Fixes

✅ Game starts without 500 errors
✅ State displays correctly
✅ Actions process successfully
✅ No CORS issues (we added CORS)
✅ Console is clean (no red errors)

---

## Frontend Dev Server Commands

While dev server is running, press:
- `o` - Open in browser
- `r` - Restart server
- `u` - Show server URL
- `c` - Clear console
- `q` - Quit server

---

## Summary

The frontend is running successfully! Now it's a matter of:
1. Verifying it connects to the backend
2. Testing game functionality
3. Checking for any errors in the console

If you see any errors, check:
1. Backend is running
2. Backend API URL is correct  
3. CORS is enabled on backend (we added it)
4. Database is initialized (we fixed migrations!)

Good luck testing!
