package com.ridebuddy.controller;
import com.ridebuddy.dto.NotificationDtos.Response;
import com.ridebuddy.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/v1/notifications")
public class NotificationController {
 private final NotificationService notifications;
 public NotificationController(NotificationService notifications){this.notifications=notifications;}
 @GetMapping public List<Response> list(Authentication a){return notifications.list(id(a));}
 @PutMapping("/{id}/read") @ResponseStatus(HttpStatus.NO_CONTENT) public void read(Authentication a,@PathVariable UUID id){notifications.markRead(id(a),id);}
 private UUID id(Authentication a){return(UUID)a.getPrincipal();}
}
