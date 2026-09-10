package com.ridebuddy.dto;
import com.ridebuddy.entity.Role;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.UUID;
public final class AuthDtos {
    private AuthDtos() {}
    public record RegisterRequest(@NotBlank @Size(max=120) String name, @NotBlank @Email String email, @NotBlank @Size(min=8, max=72) String password, @Size(max=32) String phone, Role role) {}
    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
    public record UserResponse(UUID id, String name, String email, Role role, String phone, String vehicleBrand, String vehicleModel, Instant createdAt) {}
    public record AuthResponse(String accessToken, UserResponse user) {}
}
