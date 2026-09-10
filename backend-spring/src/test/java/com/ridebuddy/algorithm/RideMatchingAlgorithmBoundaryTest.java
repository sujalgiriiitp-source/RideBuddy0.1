package com.ridebuddy.algorithm;

import com.ridebuddy.entity.*;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class RideMatchingAlgorithmBoundaryTest {
    private final User owner = new User("Driver", "driver@example.com", "hash", Role.DRIVER, null);

    @Test
    void excludesRidesOutsideTheTwoHourWindow() {
        Instant intentTime = Instant.parse("2026-01-01T10:00:00Z");
        TravelIntent intent = new TravelIntent(owner, "Campus", "Airport", intentTime);
        Ride late = new Ride(owner, "Campus", "Airport", intentTime.plus(121, ChronoUnit.MINUTES), BigDecimal.TEN, 2);

        assertTrue(RideMatchingAlgorithm.rank(intent, List.of(late)).isEmpty());
    }

    @Test
    void includesTheExactTwoHourBoundaryAndScoresItLower() {
        Instant intentTime = Instant.parse("2026-01-01T10:00:00Z");
        TravelIntent intent = new TravelIntent(owner, "Campus", "Airport", intentTime);
        Ride exact = new Ride(owner, "Campus", "Airport", intentTime.plus(120, ChronoUnit.MINUTES), BigDecimal.TEN, 2);

        var matches = RideMatchingAlgorithm.rank(intent, List.of(exact));
        assertEquals(1, matches.size());
        assertEquals(80, matches.get(0).score());
    }

    @Test
    void excludesRidesWithoutAvailableSeats() {
        Instant intentTime = Instant.parse("2026-01-01T10:00:00Z");
        TravelIntent intent = new TravelIntent(owner, "Campus", "Airport", intentTime);
        Ride full = new Ride(owner, "Campus", "Airport", intentTime, BigDecimal.TEN, 2);
        full.reserve(2);

        assertTrue(RideMatchingAlgorithm.rank(intent, List.of(full)).isEmpty());
    }

    @Test
    void ranksCloserDepartureBeforeLaterCompatibleDeparture() {
        Instant intentTime = Instant.parse("2026-01-01T10:00:00Z");
        TravelIntent intent = new TravelIntent(owner, "Campus", "Airport", intentTime);
        Ride later = new Ride(owner, "Campus", "Airport", intentTime.plus(60, ChronoUnit.MINUTES), BigDecimal.TEN, 2);
        Ride close = new Ride(owner, "Campus", "Airport", intentTime.plus(6, ChronoUnit.MINUTES), BigDecimal.TEN, 2);

        var matches = RideMatchingAlgorithm.rank(intent, List.of(later, close));
        assertEquals(List.of(close, later), matches.stream().map(RideMatchingAlgorithm.ScoredRide::ride).toList());
    }
}
