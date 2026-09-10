# Deployment

## Local Maven

Set `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, and a 32+ character `JWT_SECRET`, then run `mvn spring-boot:run` from `backend-spring`.

## Docker Compose

`docker compose -f docker/docker-compose.yml up --build` starts PostgreSQL and the Spring service. Flyway validates and applies migrations when the backend starts. Override `DATABASE_PASSWORD`, `JWT_SECRET`, and `CORS_ALLOWED_ORIGINS` through the shell or an untracked `.env` file.

## Production considerations

Use a managed PostgreSQL database, a secret manager, HTTPS termination, a distributed rate limiter, centralized logs, and a key rotation strategy. Do not use the Compose development credentials in production.
