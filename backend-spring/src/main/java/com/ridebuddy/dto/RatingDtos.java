package com.ridebuddy.dto;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.UUID;
public final class RatingDtos {
 private RatingDtos(){}
 public record CreateRequest(@NotNull UUID rideId,@NotNull UUID ratedUserId,@Min(1) @Max(5) int stars,@Size(max=500) String review){}
 public record Response(UUID id,UUID rideId,UUID raterId,UUID ratedUserId,int stars,String review,Instant createdAt){}
}
