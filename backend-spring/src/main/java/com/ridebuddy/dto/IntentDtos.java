package com.ridebuddy.dto;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.UUID;
public final class IntentDtos {
    private IntentDtos() {}
    public record CreateRequest(@NotBlank @Size(max=255) String source, @NotBlank @Size(max=255) String destination, @NotNull @Future Instant departureTime) {}
    public record Response(UUID id, UUID userId, String source, String destination, Instant departureTime, String status) {}
    public record MatchResponse(UUID rideId, int score, RideDtos.Response ride) {}
}
