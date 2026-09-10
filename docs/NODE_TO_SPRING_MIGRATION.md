# Node.js to Spring Migration

The Node.js/Express backend is intentionally preserved in `server/` during migration. It remains the compatibility implementation for chat, notifications, uploads, maps, subscriptions, and other routes not yet migrated.

| Existing Node route | Spring route | Status |
|---|---|---|
| `/api/auth/register` | `/api/v1/auth/register` | Implemented |
| `/api/auth/login` | `/api/v1/auth/login` | Implemented |
| `/api/users/profile` | `/api/v1/users/me` | Implemented |
| `/api/rides` | `/api/v1/rides` | Implemented for CRUD/search |
| `/api/rides/:id/join` | `/api/v1/rides/:id/join` | Implemented transactionally |
| `/api/intents` | `/api/v1/intents` | Implemented for create/list/matching |
| bookings, ratings, chat, notifications | Spring equivalents | Pending parity work |

The mobile app continues to use `EXPO_PUBLIC_API_URL` and the existing `/api` contract by default. Switching it to Spring should happen after endpoint parity and end-to-end verification; the versioned Spring API can be selected by setting the environment URL to a deployment that exposes the compatible client routes.
