# RideBuddy Current Architecture Assessment

**Date**: September 2024  
**Current State**: Node.js + Express + MongoDB  
**Target State**: Java + Spring Boot + PostgreSQL (additive, not replacement)

---

## Overview

RideBuddy is a **production-ready student ride-sharing platform** with existing mobile and backend implementations. The project currently comprises:

1. **Backend**: Node.js + Express + MongoDB (Mongoose)
2. **Mobile**: React Native (Expo SDK 55)
3. **Web**: Next.js (TypeScript)

---

## Current Architecture Stack

### Backend (Node.js + Express)

**Framework**: Express.js 4.21.1  
**Runtime**: Node.js  
**Database**: MongoDB (Mongoose 8.8.0)  
**Port**: 5000-5002

#### Middleware Layer
- **Authentication**: JWT (jsonwebtoken 9.0.2)
  - Auth middleware: JWT validation on protected routes
  - Token strategy: access token only (no refresh token currently documented)
- **Authorization**: Role-based (USER, DRIVER, ADMIN)
- **Validation**: Joi 17.13.3 (strict request validation)
- **Security**:
  - Helmet 8.0.0 (security headers)
  - bcryptjs 2.4.3 (password hashing)
  - CORS enabled globally (origin: '*')
  - Rate limiting via express-rate-limit
- **File Uploads**: Multer 2.1.1 + Sharp 0.34.5 (image resizing)
- **Error Handling**: Centralized error handler middleware
- **Logging**: Winston 3.15.0 (structured logging)
- **Async Handling**: Custom asyncHandler wrapper

#### Service Layer (12 Services)

| Service | Responsibility |
|---------|-----------------|
| `authService.js` | User registration, login, JWT generation |
| `userService.js` | User profile management |
| `rideService.js` | Ride CRUD, ride lifecycle management |
| `rideMatchingService.js` | Ride-to-intent matching algorithm |
| `intentService.js` | Travel intent creation, retrieval, matching |
| `bookingService.js` | Ride booking/joining logic |
| `notificationService.js` | In-app notification management |
| `notificationEventService.js` | Event-driven notification triggers |
| `fcmService.js` | Firebase Cloud Messaging integration |
| `ratingService.js` | Ride ratings and reviews |
| `mapboxService.js` | Mapbox geocoding + routing |
| `imageService.js` | Image upload and processing |

#### Controllers Layer (10 Controllers)

| Controller | Endpoints |
|-----------|-----------|
| `authController.js` | POST /auth/register, /auth/login |
| `rideController.js` | GET/POST /rides, /rides/:id |
| `bookingController.js` | POST /rides/:id/join, /bookings |
| `intentController.js` | POST/GET /intents, /intents/match |
| `userController.js` | GET /users/profile |
| `chatController.js` | WebSocket chat via Socket.io |
| `notificationController.js` | Notification endpoints |
| `ratingController.js` | Rating endpoints |
| `mapboxController.js` | Map/location services |
| `uploadController.js` | File upload endpoints |

#### Models (7 Data Models)

| Model | Fields | Key Features |
|-------|--------|--------------|
| **User** | name, email, password, role, phone, vehicle info, profile, subscription tier | Roles: USER/DRIVER/ADMIN; subscription support |
| **Ride** | pickup, drop, source, destination, departure time, seats available, price, status, driver, passengers | Status: pending/accepted/completed; supports ride tracking |
| **Booking** | ride, user, status, seat count, payment status | Links users to rides |
| **TravelIntent** | user, source, destination, departure time range, seats needed | Demand-side marketplace |
| **Message** | conversation, sender, text, timestamp | WebSocket-based chat |
| **Conversation** | participants, lastMessage | Chat thread container |
| **Notification** | user, type, title, body, read status, data | In-app + FCM push |
| **Rating** | rater, ratee, ride, rating, review, type | Mutual rider-driver ratings |
| **Driver** | Related to User (profile extension) | Vehicle and licensing info |

#### Real-Time Features
- **Socket.io 4.8.1**: Real-time ride tracking and chat
- **Ride Tracking Socket**: Location updates during active rides
- **Chat Socket**: Live messaging between rider and driver

#### Validation Layer (7 Validation Schemas)
- Auth (registration, login)
- Rides (creation, updates, joins)
- Intents (creation, matching)
- Ratings
- Users
- Bookings
- Notifications

#### Existing Endpoints

**Authentication**
```
POST   /api/auth/register
POST   /api/auth/login
```

**Rides**
```
POST   /api/rides              (create ride)
GET    /api/rides              (list all rides)
GET    /api/rides/:id          (get single ride)
PUT    /api/rides/:id          (update ride)
DELETE /api/rides/:id          (cancel ride)
POST   /api/rides/:id/join     (join/book ride)
POST   /api/rides/:id/leave    (leave ride)
```

**Travel Intent System**
```
POST   /api/intents            (create intent)
GET    /api/intents            (list intents)
GET    /api/intents/:id        (get single intent)
POST   /api/intents/match      (find matching rides)
```

**User**
```
GET    /api/users/profile      (authenticated user profile)
```

**Chat**
```
WebSocket connections for real-time messaging
```

**Ratings**
```
POST   /api/ratings            (submit rating)
GET    /api/ratings            (fetch ratings)
```

**Notifications**
```
GET    /api/notifications
POST   /api/notifications/register-token
```

---

## Mobile Application (React Native + Expo)

**Framework**: React Native 0.83.4  
**Build System**: Expo 55.0.11  
**Navigation**: Expo Router v15 + React Navigation  
**Styling**: TailwindCSS 4.2.2  
**HTTP Client**: Axios 1.7.7 (with auth interceptor)  
**State Management**: React Context API  
**Real-Time**: Socket.io-client 4.8.3  
**Maps**: @rnmapbox/maps 10.1.38 (Mapbox integration)  
**Notifications**: expo-notifications 55.0.16  

#### Key Screens
- Authentication (login, signup)
- Ride discovery (map-based + list view)
- Ride creation
- Travel intent posting
- User profile
- Chat (WebSocket-based)
- Notifications
- Ratings

#### API Integration
- Base URL from environment: `EXPO_PUBLIC_API_URL`
- JWT token stored in AsyncStorage
- Axios interceptor for auth headers
- Error handling with Toast notifications

---

## Web Application (Next.js)

**Framework**: Next.js 16.2.2  
**Language**: TypeScript  
**Styling**: TailwindCSS 4.2.2  
**Status**: Minimal (basic pages only)

#### Current Pages
- Chat page
- Ride detail page
- Subscription page
- Intent page
- Profile page
- Create ride page
- Notifications page
- Login page

---

## Database Schema (MongoDB)

### Collections

**users**
- _id (ObjectId)
- name, email, password (hashed)
- role (enum: user/driver/admin)
- phone, vehicleType, vehicleBrand, vehicleModel, vehicleColor
- profileImageUrl, registrationDocumentUrl
- subscriptionTier, subscriptionExpiry
- isVerified, isActive
- createdAt, updatedAt

**rides**
- _id (ObjectId)
- pickup, drop, source, destination
- user (ref: User)
- driver (ref: User, nullable)
- status (enum: pending/accepted/completed)
- departureTime, arrivalTime
- availableSeats, pricePerSeat, totalPrice
- passengers (array of user refs)
- lastLocation (geo coordinates)
- createdAt, updatedAt

**travelintents**
- _id (ObjectId)
- user (ref: User)
- source, destination
- departureTime, timeWindow
- seatsNeeded
- status (enum: active/matched/completed/expired)
- createdAt, updatedAt

**bookings**
- _id (ObjectId)
- ride (ref: Ride)
- user (ref: User)
- seatsBooked
- status (enum: pending/confirmed/cancelled)
- paymentStatus
- createdAt, updatedAt

**notifications**
- _id (ObjectId)
- user (ref: User)
- type (enum: ride_joined/ride_started/etc)
- title, body, data
- isRead
- createdAt

**messages**
- _id (ObjectId)
- conversation (ref: Conversation)
- sender (ref: User)
- text
- createdAt

**conversations**
- _id (ObjectId)
- participants (array of user refs)
- lastMessage (text)
- lastMessageTime
- createdAt

**ratings**
- _id (ObjectId)
- rater (ref: User)
- ratee (ref: User)
- ride (ref: Ride)
- rating (1-5)
- review (text)
- type (enum: driver_rating/rider_rating)
- createdAt

---

## Authentication & Authorization

### Current Implementation
- **Registration**: Email + password, bcrypt hashing
- **Login**: Email + password validation, JWT issued
- **JWT**: Access token only (no refresh token mechanism currently implemented)
- **Protected Routes**: Middleware validates JWT, extracts user ID
- **Roles**: USER, DRIVER, ADMIN (enforced via middleware)
- **CORS**: Globally enabled (permissive, "*")

### Security Observations
- ✅ Password hashing with bcryptjs
- ✅ JWT for stateless auth
- ✅ Role-based authorization
- ⚠️ No refresh token mechanism (only access token)
- ⚠️ Global CORS (should restrict to frontend domains in production)
- ⚠️ JWT secret stored in environment (good), but no rotation strategy

---

## Data Structures & Algorithms

### Ride Matching Algorithm (rideMatchingService.js)

**Problem**: Given a user's travel intent (source, destination, time, seats), find compatible rides.

**Approach**: Multi-factor scoring
1. **Geographic proximity**: Calculate distance between intent source/dest and ride source/dest
2. **Time compatibility**: Check if ride departure is within user's time window
3. **Seat availability**: Verify sufficient seats available
4. **Score aggregation**: Weighted sum of factors

**Data Structures Used**:
- Array of rides (filtered & sorted)
- Distance calculation using Haversine formula (Mapbox integration)
- Scoring function (weighted factors)

**Complexity**:
- Time: O(n) where n = number of active rides
- Space: O(n) for result array
- Limitation: No spatial indexing (linear scan)

### Intent Matching (intentService.js)

**Problem**: Find all active rides matching a newly posted travel intent.

**Approach**: 
1. Fetch all active rides
2. Apply rideMatchingService scoring
3. Rank by score
4. Return top matches

**Data Structures**: Arrays, objects

**Complexity**: O(n log n) with sorting

### Ride Lifecycle (rideService.js)

**States**: pending → accepted → completed  
**Seat Allocation**: First-come-first-served (booking order)  
**Validation**: Prevent double bookings, validate seat limits

---

## Error Handling

### Centralized Error Middleware
- Custom `ApiError` class with status codes and messages
- Catches all thrown errors, returns JSON response
- Format: `{ success: false, error: { code, message }, timestamp, path }`

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad request (validation errors)
- 401: Unauthorized (auth failures)
- 403: Forbidden (permission denied)
- 404: Not found
- 500: Server error

### Validation
- Joi schemas enforce input constraints
- Pre-route validation via middleware
- Response errors include validation details

---

## Logging

### Winston Logger
- **Level**: debug, info, warn, error
- **Transport**: Console (development)
- **Format**: JSON with timestamp
- **Usage**: authService, rideService, controllers log key events

### What's Logged
- Authentication attempts (successful & failed)
- Ride creation/cancellation
- Booking attempts
- Database errors
- Server startup/shutdown

### What's NOT Logged
- Request/response bodies (headers only)
- Sensitive data (passwords, tokens)

---

## Rate Limiting

### Current Implementation
- `express-rate-limit` middleware
- Default limits on auth endpoints (login, register)
- Public ride search (higher limit)
- Applied to protect against abuse

### Configuration
- Window: 15 minutes
- Max requests per window: varies by endpoint
- Returns 429 (Too Many Requests) when exceeded

---

## Caching

### Current State
- **No Redis**: Caching not implemented
- **Potential candidates**:
  - Popular ride searches
  - User profile data (read-heavy)
  - Notification feed
  - Matching results

---

## Testing

### Current State
- **No unit tests**
- **No integration tests**
- **No CI/CD pipeline**
- **Manual Postman testing** required

---

## Deployment

### Current State
- Single Node.js server (can run on Render, Railway, AWS, GCP)
- MongoDB Atlas (managed cloud MongoDB)
- Environment-based configuration (.env)
- No Docker containerization currently

### Environment Variables (from .env.example)
```
MONGO_URI
JWT_SECRET
PORT
CLIENT_ORIGIN
MAPBOX_ACCESS_TOKEN
FIREBASE_*
```

---

## API Documentation

### Current State
- No OpenAPI/Swagger documentation
- Endpoints documented in README.md
- No interactive API explorer

---

## Web Integration

### Current State
- Next.js web app exists but minimal implementation
- Likely not fully integrated with backend
- Separate from Expo mobile app

---

## Known Issues & Limitations

1. **No Refresh Token Strategy**: Only access tokens; no token refresh mechanism
2. **No Pagination**: API doesn't support large result sets efficiently
3. **No Caching**: Every request hits database
4. **No Spatial Indexing**: Ride matching does linear scan on all rides
5. **No Testing**: Zero test coverage
6. **No Docker**: Manual environment setup required
7. **No CI/CD**: No automated build/test pipeline
8. **Permissive CORS**: Allows all origins
9. **No API Versioning**: Single /api path (should be /api/v1 or /api/v2)
10. **No Observability**: No health checks, metrics, or structured tracing
11. **No Database Migrations**: Schema changes are ad-hoc
12. **No Data Validation at Database Layer**: Relies only on application-level validation

---

## Preserved Features to Maintain

When implementing the Spring Boot backend:

✅ **Core Entities**:
- User (with roles: USER, DRIVER, ADMIN)
- Ride (with seats, pricing, status)
- TravelIntent (demand-side matching)
- Booking/Participation
- Ratings
- Messages/Conversations

✅ **Key Functionalities**:
- Secure authentication (JWT)
- Role-based authorization
- Ride creation and discovery
- Ride joining with seat management
- Travel intent posting and matching
- Real-time chat (preserve Socket.io)
- Notifications
- Rating system
- Image uploads

✅ **Data Models & Relationships**:
- User → Rides (1:many, driver perspective)
- User → Bookings (1:many, passenger perspective)
- Ride → Passengers (1:many)
- User → Intents (1:many)
- User → Ratings (1:many, as rater and ratee)
- Conversation → Messages (1:many)

✅ **Security Practices**:
- Password hashing (bcrypt)
- JWT authentication
- Input validation (Joi → Jakarta Bean Validation)
- Error handling middleware
- Rate limiting

---

## Migration Strategy

### Phase 1: Assessment (Current Phase)
✅ Document existing architecture  
✅ Identify core functionality  

### Phase 2: Spring Boot Setup
- Create Spring Boot project
- Set up PostgreSQL database
- Configure JPA entities (mapping from MongoDB models)
- Implement authentication (Spring Security + JWT)

### Phase 3: Core Endpoints
- Implement User/Auth APIs
- Implement Ride CRUD + Join/Leave
- Implement Intent + Matching
- Ensure API compatibility with existing mobile client

### Phase 4: Advanced Features
- Add caching (Redis)
- Add rate limiting (Spring Cloud)
- Add observability (Actuator, Micrometer)
- Add comprehensive testing (JUnit, Mockito)

### Phase 5: Integration
- Update mobile app to call Spring backend
- Maintain Socket.io for real-time features
- Run parallel testing (Node.js vs Spring backends)

### Phase 6: Cutover
- Mark Node.js backend as legacy
- Ensure Spring backend handles all traffic
- Archive/document Node.js implementation

---

## Summary Table

| Aspect | Current (Node.js) | Target (Spring Boot) |
|--------|-------------------|----------------------|
| **Runtime** | Node.js | Java 21 LTS |
| **Framework** | Express.js | Spring Boot 3.x |
| **Database** | MongoDB | PostgreSQL 15+ |
| **ORM** | Mongoose | Spring Data JPA |
| **Auth** | JWT (custom) | Spring Security + JWT |
| **Validation** | Joi | Jakarta Bean Validation |
| **Testing** | None | JUnit 5 + Mockito |
| **Docs** | README | OpenAPI/Swagger |
| **Deployment** | Manual | Docker + CI/CD |
| **Observability** | Winston logs | Actuator + Micrometer |
| **Caching** | None | Redis (optional) |
| **Rate Limiting** | express-rate-limit | Spring Cloud Circuit Breaker |

---

## Next Steps

1. **✅ CURRENT_ARCHITECTURE.md**: Created (this document)
2. **Phase 1 - Inspect**: Complete
3. **Phase 2 - Spring Boot Setup**: Initialize Maven/Gradle project
4. **Phase 3 - Database & Entities**: Design PostgreSQL schema, create JPA entities
5. **Phase 4 - Authentication**: Implement Spring Security
6. **Continue incrementally**: Test after each phase, do not rush

---

**Document Updated**: September 9, 2024  
**Status**: Architecture assessment complete. Ready for Phase 2 Spring Boot implementation.
