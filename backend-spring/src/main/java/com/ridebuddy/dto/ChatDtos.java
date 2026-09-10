package com.ridebuddy.dto;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.UUID;
public final class ChatDtos {
 private ChatDtos(){}
 public record SendRequest(@NotNull UUID conversationId,@NotBlank @Size(max=4000) String content,@Size(max=20) String messageType){}
 public record StartRequest(UUID rideId, @NotNull UUID participantId){}
 public record ConversationResponse(UUID id,UUID rideId,int participantCount){}
 public record MessageResponse(UUID id,UUID conversationId,UUID senderId,String messageType,String content,Instant createdAt){}
}
