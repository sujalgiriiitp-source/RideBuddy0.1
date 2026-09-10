# RideBuddy Feature Parity Checklist

Compared against `server/src/routes`, `server/src/controllers`, `server/src/models`, and the Expo calls under `mobile/src`.

> Status reviewed 2026-09-10. Spring is an additive `/api/v1` backend; Node `/api`
> remains the compatibility fallback. Items below are marked only for code that
> exists and has been inspected, not for unverified runtime claims.

## Implemented

- [Implemented] Registration and login with BCrypt, signed JWT access tokens, role claims, and protected Spring endpoints.
- [Implemented] Current-user profile retrieval and authenticated profile updates.
- [Implemented] Ride creation, details, update, cancellation, paginated search, filtering, sorting, and lifecycle status.
- [Implemented] Transactional ride booking, duplicate booking protection, seat limits, and leave/cancellation.
- [Implemented] Travel-intent creation/listing and route/time/seat matching with ranking.
- [Implemented] Rating creation with 1-5 validation, duplicate prevention, and ratings-by-user retrieval.
- [Implemented] Persisted notification listing and mark-as-read for authenticated users.
- [Implemented] Persisted conversations, participant authorization, message creation, and message listing.
- [Implemented] Flyway PostgreSQL schema with foreign keys, unique constraints, indexes, and capacity checks.
- [Implemented] DTO validation, centralized error responses, CORS configuration, Actuator health/info/metrics, OpenAPI UI, structured request boundaries, and sensitive-endpoint rate limiting.
- [Implemented] Maven build/test workflow, Dockerfile, and PostgreSQL/backend Compose environment.

## Partially Implemented

- [Partially Implemented] Mobile integration: the shared Expo client supports Spring direct DTOs, auth aliases, refresh-token persistence, booking aliases, and profile aliases. The app still defaults to Node and has not been exercised screen-by-screen against a live Spring/PostgreSQL deployment.
- [Implemented] Authentication lifecycle: BCrypt access tokens, 30-day rotating refresh tokens, refresh-token revocation on logout, and one-time account-token persistence are implemented.
- [Partially Implemented] Chat: persisted HTTP conversations/messages are implemented; Socket.io-compatible real-time transport and read receipts are not.
- [Partially Implemented] Notifications: persisted in-app notifications are implemented; FCM/Expo push-token registration and delivery are not.
- [Implemented] Booking API: ride join/leave, `/bookings`, `/bookings/my`, `/bookings/my-bookings`, `/bookings/ride/{rideId}/mine`, and cancellation aliases are implemented.
- [Partially Implemented] Integration verification: Maven tests run locally; PostgreSQL/Testcontainers and Docker runtime verification depend on the local Docker runtime.

## Missing and intentionally retained in Node.js

- [Missing] Mapbox geocoding, route calculation, and location endpoints.
- [Missing] Image upload and Sharp processing endpoints.
- [Missing] Subscription tiers and subscription middleware.
- [Missing] Socket.io ride tracking.
- [Missing] Expo/FCM push-token registration and delivery.
- [Partially Implemented] Password reset and email verification tokens are persisted, single-use, and SMTP-deliverable when `MAIL_ENABLED=true`; the resend endpoint exists, but configured SMTP delivery has not been runtime-verified.
- [Partially Implemented] Expo response-envelope compatibility is normalized in the shared client and auth/booking aliases are available; complete mobile cutover still requires deploying Spring and exercising every screen against it.

These features remain in the existing Node service and have not been deleted. The migration is not complete until each retained feature has a verified Spring contract and the mobile client has been switched deliberately.
