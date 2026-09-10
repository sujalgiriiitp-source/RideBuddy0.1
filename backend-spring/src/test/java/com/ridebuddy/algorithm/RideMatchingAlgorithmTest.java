package com.ridebuddy.algorithm;

import com.ridebuddy.entity.*;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class RideMatchingAlgorithmTest {
    @Test void ranksCompatibleRoutesAndRejectsDifferentRoutes() {
        User owner = new User("Driver", "driver@example.com", "hash", Role.DRIVER, null);
        TravelIntent intent = new TravelIntent(owner, "Campus", "Airport", Instant.now().plus(1, ChronoUnit.HOURS));
        Ride compatible = new Ride(owner, "Campus Gate", "Airport Terminal", intent.getDepartureTime(), BigDecimal.TEN, 3);
        Ride different = new Ride(owner, "Library", "Market", intent.getDepartureTime(), BigDecimal.TEN, 3);
        var ranked = RideMatchingAlgorithm.rank(intent, List.of(different, compatible));
        assertEquals(1, ranked.size());
        assertSame(compatible, ranked.get(0).ride());
        assertTrue(ranked.get(0).score() > 80);
    }
}
