# RideBuddy Spring API

The new backend is versioned under `/api/v1`. The existing Node.js API remains available under `/api` while migration is verified.

## Authentication

`POST /api/v1/auth/register`

```json
{"name":"Asha","email":"asha@example.com","password":"correct-horse-battery","role":"USER"}
```

`POST /api/v1/auth/login` returns an access token and rotating refresh token. Send the access token as `Authorization: Bearer <token>` to protected endpoints. Use `/auth/refresh` to rotate and `/auth/logout` to revoke a refresh token.

`POST /api/v1/auth/forgot-password` and `POST /api/v1/auth/reset-password` provide single-use password reset tokens. `POST /api/v1/auth/verify-email?token=...` consumes an email verification token. Configure SMTP and `MAIL_ENABLED=true` for delivery.

`POST /api/v1/auth/resend-verification` accepts `{ "email": "..." }` and
returns the same non-disclosing message whether or not the account exists.
Unknown password-reset emails are handled the same way to avoid account
enumeration.

## Users

`GET /api/v1/users/me` returns the authenticated user's profile.

`PUT /api/v1/users/me` updates the authenticated user's name, phone, and vehicle details.

## Rides

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/rides` | Yes | Create a ride |
| GET | `/api/v1/rides` | No | Paginated open ride search |
| GET | `/api/v1/rides/{id}` | No | Ride details |
| PUT | `/api/v1/rides/{id}` | Owner | Update a ride |
| DELETE | `/api/v1/rides/{id}` | Owner | Cancel a ride |
| POST | `/api/v1/rides/{id}/join` | Yes | Reserve seats |
| DELETE | `/api/v1/rides/{id}/leave` | Yes | Cancel the current booking |

Search supports `source`, `destination`, `from`, `to`, `page`, `size`, and `sort`.

## Travel intents

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/intents` | Yes | Create an open travel intent |
| GET | `/api/v1/intents` | Yes | List the current user's intents |
| GET | `/api/v1/intents/{id}/match` | Owner | Rank compatible open rides |

## Ratings, notifications, and chat

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/v1/ratings` | Yes | Rate another user for a ride |
| GET | `/api/v1/ratings/user/{userId}` | No | List ratings for a user |
| GET | `/api/v1/notifications` | Yes | List in-app notifications |
| PUT | `/api/v1/notifications/{id}/read` | Yes | Mark an owned notification read |
| POST | `/api/v1/chat/conversations` | Yes | Start a participant conversation |
| GET | `/api/v1/chat/conversations` | Yes | List conversations for the user |
| GET | `/api/v1/chat/messages/{conversationId}` | Yes | List authorized conversation messages |
| POST | `/api/v1/chat/messages` | Yes | Send a persisted text message |

## Compatibility aliases

The Spring API also exposes `/api/v1/auth/signup`, `/api/v1/users/profile`,
`/api/v1/bookings/my-bookings`, `/api/v1/bookings/ride/{rideId}/mine`, and
`/api/v1/bookings/{rideId}/cancel` for existing Expo call sites. Spring
responses are direct DTOs; `mobile/src/api.js` wraps those responses in the
legacy `{ success, data }` shape. The Node service remains available under
`/api` for features listed in `FEATURE_PARITY.md`.

Validation errors use HTTP 400 and a consistent `ErrorResponse`. Missing or invalid tokens return HTTP 401/403 through Spring Security.

Interactive OpenAPI documentation is available at `/swagger-ui/index.html` when the service is running.
