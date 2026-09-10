# RideBuddy Algorithms

## Travel-intent matching

`RideMatchingAlgorithm` filters candidates by route text similarity, a two-hour departure window, open status, and available seats. It gives compatible routes a base score and subtracts points as departure time diverges, then returns descending scores.

For `n` database candidates, scoring is `O(n)` and ranking is `O(n log n)` because results are sorted. Additional memory is `O(n)` for the scored result list. Database filtering by status and departure time uses the `intents_match_idx`/ride search indexes.

## Seat allocation

`RideRepository.findByIdForUpdate` obtains a pessimistic row lock before `Ride.reserve` decrements capacity. This makes the critical update serializable per ride and prevents available seats from becoming negative during concurrent bookings. A booking has a database uniqueness constraint on `(ride_id, user_id)` as a second line of defense.
