# RideBuddy — Student Travel Companion Platform

Production-ready, mobile-first ride-sharing platform for students in Tier-2 Indian cities.

## What is built

- Backend: Node.js + Express + MongoDB (Mongoose)
- Security: JWT auth, Helmet, rate limiting, Joi validation
- Logging: Winston-based structured logging
- Mobile app: React Native (Expo)
- API client: Axios with auth/error interceptors
- Marketplace model:
  - Ride Creation (supply)
  - Ride Discovery (demand)
  - Travel Intent System (demand-driven matching)

---

## Monorepo Structure

```text
RideBUDDY.1/
├── server/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── index.js
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── validations/
│       └── utils/
└── mobile/
    ├── .env.example
    ├── app.json
    ├── babel.config.js
    ├── package.json
    ├── App.js
    └── src/
        ├── api/
        ├── components/
        ├── context/
        ├── navigation/
        ├── screens/
        └── theme/
```

## Root Commands (`RideBUDDY.1`)

```bash
npm install
npm run server:dev
npm run mobile:start
```

Run both together:

```bash
npm run dev:all
```

---

## Backend Setup (`server`)

### 1) Install dependencies

```bash
cd /Users/sujalgiri/RideBUDDY.1/server
npm install
```

### 2) Configure environment

```bash
cp .env.example .env
```

Set values in `.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/ridebuddy
JWT_SECRET=replace-with-a-strong-secret
PORT=5000
CLIENT_ORIGIN=*
```

### 3) Run backend

```bash
npm run dev
```

Health check:

```bash
curl http://localhost:5000/health
```

---

## Mobile Setup (`mobile`)

### 1) Install dependencies

```bash
cd /Users/sujalgiri/RideBUDDY.1/mobile
npm install
```

### 2) Configure API base URL

```bash
cp .env.example .env
```

Set your backend URL in `.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

> On physical devices, replace `localhost` with your machine LAN IP.

### 3) Run mobile app

```bash
npm start
```

Then open in Expo Go / Android / iOS simulator.

---

## API Endpoints

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`

### Rides
- `POST /api/rides` (auth)
- `GET /api/rides`
- `GET /api/rides/:id`
- `POST /api/rides/:id/join` (auth)

### Travel Intent
- `POST /api/intents` (auth)
- `GET /api/intents`
- `GET /api/intents/match` (supports query or latest user intent)

### User
- `GET /api/users/profile` (auth)

All API responses follow:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

---

## Postman Testing Checklist

### Required happy-path flow
1. Signup user A
2. Login user A
3. Create ride
4. View rides
5. Signup/login user B
6. Join ride created by user A
7. Post travel intent
8. Fetch `/api/intents/match`

### Negative cases
- Invalid login credentials → `401`
- Empty required fields → `400`
- Join with seats exceeding availability → `400`
- No auth token on protected routes → `401`
- Simulated network down in mobile app → global Axios error handling

---

## Implemented Product Features

- Secure password hashing with `bcryptjs`
- JWT issuance + Bearer auth middleware
- Strict validation with Joi schemas
- Global error middleware to prevent crashes
- API + auth rate limiting
- Card-based mobile UI with loading and empty states
- Auth stack + main tab navigation
- Travel Intent feed + matching suggestions

---

## Startup Extensions (Next Build)

1. In-app chat
   - WebSocket-based chat between rider and driver
   - Conversation per booking

2. Push notifications
   - Expo push notifications / FCM
   - Ride join updates + intent match alerts

3. Maps integration
   - Source/destination autocomplete
   - Route polyline + ETA + pickup points

4. Payments
   - Razorpay/UPI integration
   - Booking deposits and ride settlement

5. Ratings & reviews
   - Mutual rider-driver ratings
   - Trust score and fraud prevention signals

---

## Deployment Notes

- Backend can be deployed on Render/Railway/AWS/GCP
- Use managed MongoDB (MongoDB Atlas)
- Set production env vars (`MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`)
- For mobile production builds, use EAS Build and set `EXPO_PUBLIC_API_URL` to deployed backend URL
# RideBuddy0.1
