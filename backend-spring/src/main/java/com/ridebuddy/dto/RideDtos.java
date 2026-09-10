package com.ridebuddy.dto;
import com.ridebuddy.entity.RideStatus;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
public final class RideDtos {
    private RideDtos() {}
    public record CreateRequest(@NotBlank @Size(max=255) String source, @NotBlank @Size(max=255) String destination, @NotNull @Future Instant departureTime, @NotNull @DecimalMin("0.0") BigDecimal price, @Min(1) @Max(20) int seats) {}
    public record UpdateRequest(@NotBlank @Size(max=255) String source, @NotBlank @Size(max=255) String destination, @NotNull @Future Instant departureTime, @NotNull @DecimalMin("0.0") BigDecimal price, @Min(1) @Max(20) int seats) {}
    public record JoinRequest(@Min(1) @Max(20) int seats) {}
    public record Response(UUID id, UUID ownerId, String ownerName, String source, String destination, Instant departureTime, BigDecimal price, int totalSeats, int availableSeats, RideStatus status) {}
}
