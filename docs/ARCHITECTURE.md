# RideBuddy Target Architecture

RideBuddy is migrating from the existing Node.js/MongoDB service to a versioned Spring Boot/PostgreSQL service without removing the working mobile application or legacy backend prematurely.

```text
React Native / Expo mobile app
              |
              v
       Spring Boot /api/v1
              |
       controllers -> services -> repositories
              |                    |
       DTO validation          PostgreSQL
```

The Spring service uses constructor injection, DTOs at the HTTP boundary, JPA repositories, Flyway schema migrations, and transaction boundaries around seat allocation. The Node service remains available as a compatibility path for functionality still being migrated.

## Current implementation boundary

Spring currently owns authentication, user identity, rides, bookings, and travel-intent matching. PostgreSQL is the source of truth for those Spring-owned resources. Chat, notifications, ratings, uploads, maps, and subscriptions remain in the Node service until their contracts and mobile behavior have been migrated and verified.

Actuator provides health, info, and metrics endpoints. OpenAPI is generated from the Spring controllers. Docker Compose supplies PostgreSQL and the backend for local development.
