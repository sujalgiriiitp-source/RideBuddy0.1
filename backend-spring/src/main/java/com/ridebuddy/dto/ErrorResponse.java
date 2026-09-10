package com.ridebuddy.dto;
import java.time.Instant;
import java.util.List;
public record ErrorResponse(boolean success, String code, String message, Instant timestamp, String path, List<String> details) {}
