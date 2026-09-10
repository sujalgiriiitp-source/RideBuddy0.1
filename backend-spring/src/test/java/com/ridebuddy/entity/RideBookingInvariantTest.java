package com.ridebuddy.entity;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class RideBookingInvariantTest {
    @Test
    void reserveAndReleaseNeverExceedCapacity() {
        User owner = new User("Driver", "driver@example.com", "hash", Role.DRIVER, null);
        Ride ride = new Ride(owner, "Campus", "Airport", Instant.now(), BigDecimal.TEN, 3);

        ride.reserve(2);
        assertEquals(1, ride.getAvailableSeats());
        ride.release(2);
        assertEquals(3, ride.getAvailableSeats());
    }

    @Test
    void rejectsReservationsForClosedOrOverCapacityRides() {
        User owner = new User("Driver", "driver@example.com", "hash", Role.DRIVER, null);
        Ride ride = new Ride(owner, "Campus", "Airport", Instant.now(), BigDecimal.TEN, 2);

        assertThrows(IllegalStateException.class, () -> ride.reserve(3));
        ride.cancel();
        assertThrows(IllegalStateException.class, () -> ride.reserve(1));
    }
}
