package com.ridebuddy.algorithm;

import com.ridebuddy.entity.Ride;
import com.ridebuddy.entity.TravelIntent;
import java.time.Duration;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

public final class RideMatchingAlgorithm {
    private RideMatchingAlgorithm() {}
    public record ScoredRide(Ride ride, int score) {}
    public static List<ScoredRide> rank(TravelIntent intent, List<Ride> rides) {
        return rides.stream().map(ride -> new ScoredRide(ride, score(intent, ride)))
            .filter(result -> result.score() > 0).sorted(Comparator.comparingInt(ScoredRide::score).reversed()).toList();
    }
    static int score(TravelIntent intent, Ride ride) {
        if (!ride.getSource().toLowerCase(Locale.ROOT).contains(intent.getSource().toLowerCase(Locale.ROOT))
            && !intent.getSource().toLowerCase(Locale.ROOT).contains(ride.getSource().toLowerCase(Locale.ROOT))) return 0;
        if (!ride.getDestination().toLowerCase(Locale.ROOT).contains(intent.getDestination().toLowerCase(Locale.ROOT))
            && !intent.getDestination().toLowerCase(Locale.ROOT).contains(ride.getDestination().toLowerCase(Locale.ROOT))) return 0;
        long minutes = Math.abs(Duration.between(intent.getDepartureTime(), ride.getDepartureTime()).toMinutes());
        if (minutes > 120 || ride.getAvailableSeats() < 1) return 0;
        return 80 + Math.max(0, 20 - (int) Math.floor(minutes / 6.0));
    }
}
