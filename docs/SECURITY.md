# Spring Security Notes

- Passwords are stored as BCrypt hashes only.
- Access tokens are signed with an environment-provided HMAC secret. The application refuses secrets shorter than 32 characters.
- Refresh tokens are random, stored only as SHA-256 hashes, rotated on use, and revoked on logout.
- Password reset and email verification tokens are random, hashed at rest, expire after one hour, and can only be consumed once.
- JWT authentication loads the current user and role from PostgreSQL for every request, so role changes take effect without trusting client claims.
- Ride, intent, conversation, notification, and profile operations check ownership or participant membership in the service layer.
- CORS origins are configured with `CORS_ALLOWED_ORIGINS`; the default is limited to local development origins.
- Validation and centralized error handling prevent stack traces and database details from being returned to clients.
- Registration and matching endpoints have a simple per-IP in-process rate limit. A distributed limiter is required if multiple backend replicas are deployed.
- Requests receive an `X-Correlation-Id` response header and are logged with method, path, status, duration, and correlation ID without request bodies or credentials.

Refresh-token rotation, token revocation, email verification, and external push-token security remain migration work.
