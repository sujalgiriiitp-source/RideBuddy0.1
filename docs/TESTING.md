# Testing

Run the Spring test suite with:

```bash
cd backend-spring
mvn verify
```

The current automated suite includes a real unit test for the route/time matching algorithm. The Maven build also compiles the full application and runs Spring's test dependencies. PostgreSQL-backed controller and repository integration tests are the next migration step; they should use Testcontainers once the endpoint parity work is expanded.

The repository does not claim a coverage percentage because coverage is not currently measured.
