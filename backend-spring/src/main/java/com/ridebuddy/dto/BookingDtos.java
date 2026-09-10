package com.ridebuddy.dto;
import com.ridebuddy.entity.BookingStatus;
import java.util.UUID;
public final class BookingDtos {
    private BookingDtos() {}
    public record Response(UUID id, UUID rideId, UUID userId, int seats, BookingStatus status) {}
}
