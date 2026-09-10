# RideBuddy Spring API

The new backend is versioned under `/api/v1`. The existing Node.js API remains available under `/api` while migration is verified.

## Authentication

`POST /api/v1/auth/register`

```json
{"name":"Asha","email":"asha@example.com","password":"correct-horse-battery","role":"USER"}
```

`POST /api/v1/auth/login` returns an access token. Send it as `Authorization: Bearer <token>` to protected endpoints.

## Users

`GET /api/v1/users/me` returns the authenticated user's profile.

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

Validation errors use HTTP 400 and a consistent `ErrorResponse`. Missing or invalid tokens return HTTP 401/403 through Spring Security.

Interactive OpenAPI documentation is available at `/swagger-ui/index.html` when the service is running.
