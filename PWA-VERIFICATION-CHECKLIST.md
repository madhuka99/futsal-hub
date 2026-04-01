# PWA Verification Checklist for FutsalHub

## ✅ Pre-Build Verification

### 1. Icons Verification
- ✅ **Icon Sizes Present:**
  - [x] 72×72 (5.5K)
  - [x] 96×96 (8.0K)
  - [x] 128×128 (13K)
  - [x] 144×144 (15K)
  - [x] 152×152 (17K)
  - [x] 192×192 (25K) - maskable
  - [x] 384×384 (100K)
  - [x] 512×512 (177K) - maskable
  - [x] apple-touch-icon.png (22K)
  - [x] favicon.ico (4.1K)
  - [x] favicon-16×16.png
  - [x] favicon-32×32.png

### 2. Configuration Files
- ✅ **Manifest ([public/manifest.json](public/manifest.json)):**
  - [x] Name: "FutsalHub - Manage Your Futsal Team"
  - [x] Short name: "FutsalHub"
  - [x] Display: "standalone"
  - [x] Start URL: "/"
  - [x] Theme color: "#000000"
  - [x] Background color: "#000000"
  - [x] All icon references correct
  - [x] Shortcuts configured (Dashboard, Matches, Players)

- ✅ **Next.js Config ([next.config.mjs](next.config.mjs)):**
  - [x] @ducanh2912/next-pwa imported
  - [x] Service worker destination: "public"
  - [x] Disabled in development
  - [x] Runtime caching strategies configured
  - [x] Offline fallback: "/offline"
  - [x] Workbox caching for:
    - Static assets (fonts, images, JS, CSS)
    - Next.js data
    - Vercel Blob images (CacheFirst, 7 days)
    - Google profile images (CacheFirst, 30 days)
    - API routes (NetworkOnly/NetworkFirst)

- ✅ **Root Layout ([app/layout.js](app/layout.js)):**
  - [x] PWA metadata configured
  - [x] Apple Web App meta tags
  - [x] Viewport with viewportFit: "cover" (iOS notch support)
  - [x] Theme colors for light/dark mode
  - [x] Manifest reference: "/manifest.json"
  - [x] Icons configuration

### 3. PWA Core Files
- ✅ **Offline Database ([lib/offline-db.js](lib/offline-db.js)):**
  - [x] IndexedDB wrapper implemented
  - [x] Stores: MATCHES, PLAYERS, STATS, IMAGES, SETTINGS
  - [x] Methods: init, set, setMany, get, getAll, delete, clear

- ✅ **Session Management ([lib/session-manager.js](lib/session-manager.js)):**
  - [x] Multi-layer storage (LocalStorage + IndexedDB + SessionStorage)
  - [x] Session persistence for iOS
  - [x] Automatic token refresh
  - [x] Session restoration logic

- ✅ **Hooks:**
  - [x] [hooks/use-offline.js](hooks/use-offline.js) - Online/offline detection
  - [x] [hooks/use-sync.js](hooks/use-sync.js) - Data synchronization

- ✅ **Providers:**
  - [x] [components/providers/session-provider.jsx](components/providers/session-provider.jsx) - Session restoration on app launch

- ✅ **PWA UI Components:**
  - [x] [components/pwa/install-prompt.jsx](components/pwa/install-prompt.jsx) - Install banners for Android & iOS
  - [x] [components/pwa/update-notification.jsx](components/pwa/update-notification.jsx) - Service worker update notifications
  - [x] [components/pwa/offline-indicator.jsx](components/pwa/offline-indicator.jsx) - Offline/syncing status badge

- ✅ **Offline Fallback:**
  - [x] [app/offline/page.jsx](app/offline/page.jsx) - Offline fallback page
  - [x] [app/offline/layout.js](app/offline/layout.js) - Offline page layout

- ✅ **Utilities:**
  - [x] [lib/ios-detection.js](lib/ios-detection.js) - iOS platform and standalone detection

### 4. Integration
- ✅ **App Layout ([app/(app)/layout.js](app/(app)/layout.js)):**
  - [x] SessionProvider wrapping
  - [x] InstallPrompt component
  - [x] UpdateNotification component
  - [x] OfflineIndicator component

---

## 🧪 Post-Build Verification

### 1. Service Worker Files (Check after build)
After running `npm run build`, verify these files exist in `public/`:
- [ ] `sw.js` - Main service worker
- [ ] `workbox-*.js` - Workbox runtime files
- [ ] Service worker registered successfully

### 2. Build Output Checks
Look for in build output:
- [ ] "Compiled successfully" message
- [ ] PWA service worker generation messages
- [ ] No errors related to PWA configuration

### 3. Local Testing (`npm run start`)
After build, run locally and test:

#### Chrome DevTools Verification
1. **Application Tab > Manifest:**
   - [ ] Manifest loads without errors
   - [ ] App name: "FutsalHub"
   - [ ] Start URL: "/"
   - [ ] Icons displayed (all 8 sizes)
   - [ ] "Installable" badge shows

2. **Application Tab > Service Workers:**
   - [ ] Service worker registered
   - [ ] Status: "activated and running"
   - [ ] Update on reload works

3. **Application Tab > Cache Storage:**
   - [ ] Caches created:
     - workbox-precache
     - google-fonts-webfonts
     - google-fonts-stylesheets
     - static-font-assets
     - static-image-assets
     - next-image
     - static-js-assets
     - static-style-assets
     - next-data
     - others

4. **Application Tab > IndexedDB:**
   - [ ] `futsal_hub_offline` database created
   - [ ] `futsal_hub_sessions` database created

#### Lighthouse PWA Audit
Run Lighthouse audit (DevTools > Lighthouse):
- [ ] PWA score: Target 100%
- [ ] Checks passed:
  - [ ] Installable
  - [ ] Service worker registered
  - [ ] HTTPS (when deployed)
  - [ ] Viewport meta tag
  - [ ] Splash screen configured
  - [ ] Theme color set
  - [ ] Icons provided

#### Offline Functionality Test
1. **Go Offline:**
   - [ ] Open DevTools > Network
   - [ ] Check "Offline" checkbox
   - [ ] Reload page
   - [ ] Should see offline fallback page OR cached content

2. **Online/Offline Indicator:**
   - [ ] Badge appears when offline: "You're Offline"
   - [ ] Badge appears when syncing: "Syncing..."
   - [ ] Badge disappears when online and synced

#### Install Prompt Test (Desktop)
- [ ] Visit site (http://localhost:3000)
- [ ] Wait a few seconds
- [ ] Install prompt appears
- [ ] Click "Install"
- [ ] App installs as standalone window
- [ ] App opens in standalone mode (no browser UI)

---

## 📱 Mobile Device Testing

### Android (Chrome)

#### Installation:
1. **Visit site on Android Chrome**
2. **Automatic Install Prompt:**
   - [ ] Banner appears at bottom
   - [ ] "Install FutsalHub" button visible
   - [ ] Tap "Install"
   - [ ] App installs to home screen

3. **Manual Install:**
   - [ ] Chrome menu > "Install app" / "Add to Home screen"
   - [ ] Icon appears on home screen

4. **Launch Test:**
   - [ ] Tap icon on home screen
   - [ ] Splash screen displays (black background, FutsalHub icon)
   - [ ] App opens in standalone mode (no browser UI)
   - [ ] Status bar color matches theme

#### Offline Test:
1. **While Online:**
   - [ ] Browse matches, players, gallery
   - [ ] Data loads normally
   - [ ] No offline indicator

2. **Go Offline (Airplane mode):**
   - [ ] Turn on airplane mode
   - [ ] Close app completely
   - [ ] Reopen app
   - [ ] "You're Offline" badge appears
   - [ ] Cached content visible:
     - [ ] Matches list
     - [ ] Player statistics
     - [ ] Gallery images (cached)
     - [ ] Dashboard stats
   - [ ] Mutation buttons disabled (create match, upload, etc.)

3. **Back Online:**
   - [ ] Turn off airplane mode
   - [ ] "Syncing..." badge appears
   - [ ] Data refreshes
   - [ ] Badge disappears
   - [ ] All features work normally

#### Session Persistence:
- [ ] Log in
- [ ] Use app normally
- [ ] Close app completely
- [ ] Wait 10 minutes
- [ ] Reopen app
- [ ] **Still logged in** ✅

#### Update Notification:
- [ ] Deploy new version
- [ ] Service worker detects update
- [ ] "Update Available" notification shows
- [ ] Tap "Refresh Now"
- [ ] App reloads with new version

---

### iOS (Safari)

#### Installation:
1. **Visit site on iPhone/iPad Safari**
2. **Install Instructions Prompt:**
   - [ ] After 30 seconds, card appears
   - [ ] Shows step-by-step instructions:
     1. Tap Share button
     2. Tap "Add to Home Screen"
     3. Tap "Add"
   - [ ] Can dismiss with "Got it"

3. **Manual Install:**
   - [ ] Tap Share button (square with arrow)
   - [ ] Scroll and tap "Add to Home Screen"
   - [ ] See app name: "FutsalHub"
   - [ ] See app icon
   - [ ] Tap "Add" in top right
   - [ ] Icon appears on home screen

4. **Launch Test:**
   - [ ] Tap icon on home screen
   - [ ] Splash screen displays
   - [ ] App opens in standalone mode (no Safari UI)
   - [ ] Status bar is black-translucent
   - [ ] Content respects safe area (no notch overlap)

#### Offline Test:
1. **While Online:**
   - [ ] Browse all sections
   - [ ] Data loads normally

2. **Go Offline (Airplane mode):**
   - [ ] Turn on airplane mode
   - [ ] Close app (swipe up)
   - [ ] Reopen app
   - [ ] "You're Offline" badge shows
   - [ ] Can view cached:
     - [ ] Matches
     - [ ] Players
     - [ ] Gallery (cached images)
     - [ ] Stats
   - [ ] Cannot create/edit/upload

3. **Back Online:**
   - [ ] Turn off airplane mode
   - [ ] Data syncs automatically
   - [ ] Badge shows "Syncing..."
   - [ ] Fresh data loads

#### Session Persistence (CRITICAL for iOS):
This is the most important test for iOS:

1. **Initial Login:**
   - [ ] Log in to app
   - [ ] Use app normally
   - [ ] Close app completely (swipe up from app switcher)

2. **Short-term persistence (5 minutes):**
   - [ ] Wait 5 minutes
   - [ ] Reopen app
   - [ ] **Should still be logged in** ✅

3. **Medium-term persistence (30 minutes):**
   - [ ] Close app
   - [ ] Wait 30 minutes
   - [ ] Reopen app
   - [ ] **Should still be logged in** ✅

4. **Long-term persistence (Overnight):**
   - [ ] Close app before bed
   - [ ] Leave phone overnight
   - [ ] Next morning, reopen app
   - [ ] **Should still be logged in** ✅

5. **After Safari data clear:**
   - [ ] Go to Settings > Safari > Clear History and Website Data
   - [ ] Clear all data
   - [ ] Reopen app
   - [ ] May need to log in again (expected) ⚠️

#### iOS-Specific Checks:
- [ ] Safe area insets work (iPhone X and newer)
- [ ] No content hidden behind notch
- [ ] Status bar styled correctly
- [ ] No scrolling issues in standalone mode
- [ ] Keyboard doesn't overlap inputs

---

## 🚀 Production Deployment Testing

### Pre-Deployment:
- [ ] All local tests pass
- [ ] Lighthouse PWA score: 100%
- [ ] No console errors
- [ ] Service worker registers correctly

### Post-Deployment (Vercel):
1. **Visit Production URL:**
   - [ ] HTTPS enabled (required for PWA)
   - [ ] Manifest loads: `https://your-app.vercel.app/manifest.json`
   - [ ] Service worker registers
   - [ ] Icons load correctly

2. **Mobile Install Test:**
   - [ ] Test on physical Android device
   - [ ] Test on physical iPhone
   - [ ] Both can install successfully

3. **Lighthouse Audit (Production):**
   - [ ] Run Lighthouse on production URL
   - [ ] PWA score: 100%
   - [ ] All checks green

4. **Offline Test (Production):**
   - [ ] Visit site
   - [ ] Let service worker cache assets
   - [ ] Go offline
   - [ ] Browse cached pages
   - [ ] Works as expected

---

## 🐛 Troubleshooting

### Service Worker Not Registering
**Symptoms:** No service worker in DevTools Application tab

**Fixes:**
1. Check `next.config.mjs` has `withPWA` wrapper
2. Ensure `disable: process.env.NODE_ENV === "development"` is set
3. Run `npm run build && npm run start` (not `npm run dev`)
4. Clear browser cache and reload
5. Check for console errors

### Manifest Not Found (404)
**Symptoms:** 404 error for `/manifest.json`

**Fixes:**
1. Verify `public/manifest.json` exists
2. Check `app/layout.js` metadata has `manifest: "/manifest.json"`
3. Restart dev server
4. Clear `.next` folder: `rm -rf .next && npm run build`

### Icons Not Showing
**Symptoms:** Broken icon images in manifest

**Fixes:**
1. Verify all icons exist in `public/icons/`
2. Check icon paths in `manifest.json` are correct (`/icons/icon-*.png`)
3. Ensure icon file sizes match manifest sizes
4. Clear browser cache

### Offline Page Not Showing
**Symptoms:** Error page instead of offline page when offline

**Fixes:**
1. Verify `app/offline/page.jsx` exists
2. Check `next.config.mjs` has `fallbacks: { document: "/offline" }`
3. Rebuild: `npm run build`
4. Clear service worker in DevTools and reload

### iOS Session Not Persisting
**Symptoms:** User logged out after closing app

**Fixes:**
1. Verify `SessionProvider` wraps app layout
2. Check `lib/session-manager.js` is properly implemented
3. Ensure Supabase auth is configured for session persistence
4. Check IndexedDB is working (not in private browsing mode)
5. Verify token refresh logic is running

### Install Prompt Not Appearing (Android)
**Symptoms:** No install banner on Android Chrome

**Fixes:**
1. Ensure HTTPS is enabled (required)
2. Check Lighthouse PWA audit passes all installability criteria
3. Verify service worker is registered
4. Check manifest has all required fields
5. User may have previously dismissed prompt (wait 3 months or clear data)

### Build Errors
**Symptoms:** `npm run build` fails

**Common Issues:**
1. **Missing imports:** Check all PWA component imports in layouts
2. **TypeScript errors:** Ensure all props are correctly typed
3. **Module not found:** Run `npm install` to ensure all dependencies installed
4. **Invalid configuration:** Check `next.config.mjs` syntax

---

## ✅ Success Criteria

Your PWA is ready for production when:

- ✅ Lighthouse PWA score: **100%**
- ✅ Service worker registers on production
- ✅ Installs successfully on Android
- ✅ Installs successfully on iOS
- ✅ Works offline (view-only features)
- ✅ Session persists on both platforms
- ✅ Update notifications work
- ✅ No console errors
- ✅ Icons display correctly everywhere
- ✅ Splash screens show on mobile

---

## 📊 Metrics to Monitor

After deployment, track:

1. **Install Rate:**
   - % of users who see install prompt
   - % who actually install

2. **Offline Usage:**
   - % of users accessing app offline
   - Most viewed content offline

3. **Session Persistence:**
   - Average session duration
   - % of sessions restored successfully (iOS)

4. **Performance:**
   - Time to Interactive (TTI): < 3s
   - Cache hit rate: > 80%
   - Service worker activation time: < 500ms

5. **Platform Distribution:**
   - Android vs iOS installs
   - Browser vs standalone usage

---

## 🎯 Next Steps After Verification

Once all checks pass:

1. ✅ Deploy to production
2. ✅ Test on real devices
3. ✅ Monitor analytics
4. ✅ Gather user feedback
5. ✅ Iterate and improve

**Future Enhancements:**
- Push notifications (Android only)
- Background sync for offline mutations
- Periodic background sync
- Share Target API
- Web Share API
- App shortcuts customization
