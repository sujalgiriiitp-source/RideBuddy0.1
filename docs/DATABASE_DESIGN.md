# PostgreSQL Design

Flyway migration `V1__initial_schema.sql` creates the Spring-owned tables:

- `users`: normalized identity, password hash, role, and profile fields.
- `rides`: owner, route, departure time, price, capacity, and lifecycle status.
- `bookings`: user/ride join table with a unique constraint preventing duplicate active ownership of a ride booking.
- `travel_intents`: demand-side route requests used by the matching service.

The ride search index covers status, departure time, source, and destination. Owner and intent matching indexes support common list and matching queries. Booking uses a pessimistic row lock on the ride before decrementing `available_seats`, so concurrent reservations cannot oversell capacity.

Hibernate uses `ddl-auto=validate`; schema changes must be applied through Flyway rather than implicit production DDL.
