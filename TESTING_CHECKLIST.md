# ✅ RideBUDDY Subscription System - Testing Checklist

## Pre-Testing Setup

- [ ] Backend server is running (`cd server && npm start`)
- [ ] Mobile app is running (`cd mobile && npx expo start`)
- [ ] Database is connected
- [ ] User is logged in

---

## 🧪 Backend API Tests

### Subscription Status
- [ ] **GET /api/subscription/status** returns current tier (should be FREE by default)
- [ ] Response includes `tier`, `features`, `dailyRideCount`, `maxDailyRides`
- [ ] FREE tier shows `maxDailyRides: 5`

### Upgrade Flow
- [ ] **POST /api/subscription/upgrade** with `{ "tier": "PREMIUM" }` succeeds
- [ ] User tier changes to PREMIUM
- [ ] `subscriptionStartDate` and `subscriptionEndDate` are set
- [ ] `maxDailyRides` becomes -1 (unlimited)
- [ ] **POST /api/subscription/upgrade** with `{ "tier": "PRO" }` succeeds

### Cancel Flow
- [ ] **POST /api/subscription/cancel** downgrades to FREE
- [ ] `subscriptionStartDate` and `subscriptionEndDate` are cleared
- [ ] `maxDailyRides` resets to 5

### Ride Limit Enforcement
- [ ] FREE user can create 1st ride (count: 1/5)
- [ ] FREE user can create 2nd ride (count: 2/5)
- [ ] FREE user can create 3rd ride (count: 3/5)
- [ ] FREE user can create 4th ride (count: 4/5)
- [ ] FREE user can create 5th ride (count: 5/5)
- [ ] FREE user **cannot** create 6th ride (403 error)
- [ ] Error message says "Daily ride limit reached" with `upgradeRequired: true`
- [ ] PREMIUM user can create unlimited rides
- [ ] PRO user can create unlimited rides

### Daily Reset
- [ ] `dailyRideCount` resets to 0 the next day
- [ ] `lastRideResetDate` updates to current date

### Analytics (PRO Only)
- [ ] **GET /api/subscription/analytics** fails for FREE user (403)
- [ ] **GET /api/subscription/analytics** fails for PREMIUM user (403)
- [ ] **GET /api/subscription/analytics** succeeds for PRO user
- [ ] Response includes ride statistics and history

### Subscription Expiry
- [ ] Set `subscriptionEndDate` to past date
- [ ] Next API call auto-downgrades to FREE
- [ ] User tier is FREE after expiry

---

## 📱 Frontend UI Tests

### Profile Screen
- [ ] Subscription card is visible
- [ ] Shows correct tier name (Free/Premium/Pro)
- [ ] Shows correct tier badge (⭐ for Premium, 👑 for Pro)
- [ ] Shows correct gradient color (Gray/Amber/Purple)
- [ ] FREE users see "Upgrade to Premium" CTA
- [ ] Shows ride usage "X/5 rides today" for FREE users
- [ ] Shows "Unlimited rides" for PREMIUM/PRO users
- [ ] Tapping card navigates to subscription screen

### Subscription Screen
- [ ] Shows all 3 tier cards (FREE, PREMIUM, PRO)
- [ ] "Most Popular" badge shown on PREMIUM
- [ ] Current tier card has different styling (gradient background, white text)
- [ ] Current tier shows "Current Plan" badge
- [ ] Feature lists display correctly with checkmarks
- [ ] Prices show correctly (₹99, ₹199)
- [ ] Upgrade buttons work (not shown on current tier)
- [ ] Tapping "Upgrade" shows confirmation dialog
- [ ] Confirming upgrade calls API and shows success message
- [ ] After upgrade, profile updates immediately

### Create Ride Screen
- [ ] FREE users see ride limit banner at top
- [ ] Banner shows "X of 5 rides remaining today"
- [ ] Banner has "Upgrade to Premium" link
- [ ] Tapping upgrade link navigates to subscription screen
- [ ] PREMIUM/PRO users don't see limit banner
- [ ] Creating ride as FREE user increments counter
- [ ] Reaching limit shows upgrade alert dialog
- [ ] Alert has "Cancel" and "Upgrade" buttons
- [ ] Tapping "Upgrade" navigates to subscription screen

### Subscription Context
- [ ] `useSubscription()` hook returns correct tier
- [ ] `canCreateRide()` returns false when limit reached
- [ ] `getRidesRemaining()` shows correct count
- [ ] `fetchSubscriptionStatus()` updates state correctly
- [ ] `upgradeTo()` function works and refreshes state

---

## 🎨 Visual Design Tests

### Tier Colors & Gradients
- [ ] FREE card has gray gradient
- [ ] PREMIUM card has amber gradient (#F59E0B → #D97706)
- [ ] PRO card has purple gradient (#8B5CF6 → #7C3AED)
- [ ] Current tier card has white text
- [ ] Non-current tier cards have dark text

### Badges & Icons
- [ ] PREMIUM shows ⭐ badge
- [ ] PRO shows 👑 badge
- [ ] FREE doesn't show badge
- [ ] Checkmarks display correctly in feature lists
- [ ] Icons are properly aligned

### Responsive Layout
- [ ] Cards display correctly on iOS
- [ ] Cards display correctly on Android
- [ ] Cards display correctly on web
- [ ] Scrolling works smoothly
- [ ] Buttons are touch-friendly (adequate spacing)

---

## 🔄 Integration Tests

### End-to-End Upgrade Flow
1. [ ] Start as FREE user
2. [ ] Create 5 rides successfully
3. [ ] Try to create 6th ride
4. [ ] See upgrade prompt
5. [ ] Tap "Upgrade"
6. [ ] Navigate to subscription screen
7. [ ] Tap "Upgrade" on PREMIUM card
8. [ ] Confirm in dialog
9. [ ] See success message
10. [ ] Return to profile
11. [ ] See PREMIUM badge on subscription card
12. [ ] Create unlimited rides (no limit)

### End-to-End Cancel Flow
1. [ ] Start as PREMIUM/PRO user
2. [ ] Go to subscription screen
3. [ ] Cancel subscription (via API or future UI button)
4. [ ] Tier downgrades to FREE
5. [ ] Profile shows FREE tier
6. [ ] Daily limit of 5 rides enforced

### Cross-Screen State Sync
- [ ] Upgrade on subscription screen → Profile updates
- [ ] Create ride → Usage counter updates
- [ ] Refresh profile → Subscription data persists
- [ ] Logout/login → Subscription state reloads correctly

---

## 🐛 Error Handling Tests

### API Errors
- [ ] Invalid tier name returns 400 error
- [ ] Unauthorized request returns 401 error
- [ ] Expired token shows login prompt
- [ ] Network error shows user-friendly message

### Edge Cases
- [ ] Rapidly creating rides doesn't bypass limit
- [ ] Changing system date doesn't bypass reset
- [ ] Concurrent requests handled correctly
- [ ] Subscription expiry while offline handled gracefully

---

## 📊 Performance Tests

- [ ] Subscription status loads quickly (<500ms)
- [ ] Subscription screen renders smoothly
- [ ] No lag when scrolling plan cards
- [ ] Upgrade dialog appears instantly
- [ ] No memory leaks in subscription context

---

## ✅ Final Verification

- [ ] All backend routes work
- [ ] All frontend screens work
- [ ] Tier logic is correct
- [ ] Daily limits enforce properly
- [ ] Upgrades persist in database
- [ ] UI matches design mockups
- [ ] No console errors
- [ ] No breaking changes to existing features
- [ ] Documentation is complete
- [ ] Code is clean and commented

---

## 🎉 Success Criteria

✅ **Backend**: All API endpoints functional  
✅ **Frontend**: All screens and components working  
✅ **Business Logic**: Tier limits and upgrades correct  
✅ **UI/UX**: Beautiful, intuitive subscription flow  
✅ **Integration**: Seamless with existing app features  

---

**Status**: Ready for Testing 🚀

Run through this checklist and mark items as you test them!
