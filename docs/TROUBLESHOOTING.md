# Troubleshooting: Continuous Page Reloads

## Issue
The login page is being requested continuously (every ~1 second), causing repeated GET requests.

## Root Cause
This is **NOT a code bug**. The most common causes are:

### 1. Browser Auto-Refresh Extension
- Extensions like "LiveReload", "Auto Refresh Plus", "Tab Reloader" can cause this
- **Solution**: Disable all browser extensions or use Incognito mode

### 2. Open Browser Tabs
- Multiple tabs might be open pointing to the same URL
- Each tab refreshes independently
- **Solution**: Close all localhost:3000 tabs and reopen

### 3. Next.js HMR Issue
- Hot Module Replacement might be stuck in a loop
- File watcher detecting phantom changes
- **Solution**: Clear .next folder and restart

### 4. Network Tools
- Browser DevTools Network panel set to "Disable cache"
- Postman or other API tools auto-refreshing
- **Solution**: Close dev tools or disable auto-refresh

## Quick Fixes

### Option 1: Clean Restart
```bash
# Stop dev server (Ctrl+C in terminal)
rm -rf .next
pnpm run dev
```

### Option 2: Check Browser
1. Open Task Manager / Activity Monitor
2. Check if multiple browser processes are running
3. Close unnecessary ones
4. Open ONE fresh tab to localhost:3000

### Option 3: Disable Browser Extensions
1. Open browser in Incognito/Private mode
2. Navigate to localhost:3000/auth/login
3. If requests stop, an extension was the cause

### Option 4: Check for Running Scripts
```bash
# Check if any other processes are hitting the server
netstat -ano | findstr :3000
```

## Verification
After applying fixes, you should see:
- ONE GET request when you load the page
- NO requests when idle
- Requests only when you interact (click, submit form)

##If the issue persists after trying all above:
1. Check your browser's Console tab for errors
2. Check Network tab - look for failed requests that might retry
3. Temporarily add a breakpoint in LoginForm to see if it's re-rendering

## Notes
- The login page code is correct and not causing this
- This is a development environment issue only
- Production builds won't have this problem
