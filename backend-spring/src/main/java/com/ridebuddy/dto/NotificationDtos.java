package com.ridebuddy.dto;
import java.time.Instant;
import java.util.UUID;
public final class NotificationDtos {
 private NotificationDtos(){}
 public record Response(UUID id,String type,String title,String body,boolean read,Instant createdAt){}
}
