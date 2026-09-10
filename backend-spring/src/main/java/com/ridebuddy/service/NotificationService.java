package com.ridebuddy.service;
import com.ridebuddy.dto.NotificationDtos.Response;
import com.ridebuddy.entity.Notification;
import com.ridebuddy.exception.ApiException;
import com.ridebuddy.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
@Service public class NotificationService {
 private final NotificationRepository notifications;
 public NotificationService(NotificationRepository notifications){this.notifications=notifications;}
 public List<Response> list(UUID userId){return notifications.findByUser_IdOrderByCreatedAtDesc(userId).stream().map(this::response).toList();}
 @Transactional public void markRead(UUID userId,UUID id){Notification n=notifications.findByIdAndUser_Id(id,userId).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"NOTIFICATION_NOT_FOUND","Notification not found"));n.markRead();}
 private Response response(Notification n){return new Response(n.getId(),n.getType(),n.getTitle(),n.getBody(),n.isRead(),n.getCreatedAt());}
}
