package com.ridebuddy.dto;
import jakarta.validation.constraints.*;
public final class ProfileDtos {
 private ProfileDtos(){}
 public record UpdateRequest(@NotBlank @Size(max=120) String name,@Size(max=32) String phone,@Size(max=80) String vehicleBrand,@Size(max=80) String vehicleModel){}
}
