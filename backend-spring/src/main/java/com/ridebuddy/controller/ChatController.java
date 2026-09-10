package com.ridebuddy.controller;
import com.ridebuddy.dto.ChatDtos.*;
import com.ridebuddy.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/v1/chat")
public class ChatController {
 private final ChatService chat;
 public ChatController(ChatService chat){this.chat=chat;}
 @PostMapping("/conversations") public ResponseEntity<ConversationResponse> start(Authentication a,@Valid @RequestBody StartRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(chat.start(id(a),r));}
 @GetMapping("/conversations") public List<ConversationResponse> conversations(Authentication a){return chat.conversations(id(a));}
 @GetMapping("/messages/{conversationId}") public List<MessageResponse> messages(Authentication a,@PathVariable UUID conversationId){return chat.messages(id(a),conversationId);}
 @PostMapping("/messages") public ResponseEntity<MessageResponse> send(Authentication a,@Valid @RequestBody SendRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(chat.send(id(a),r));}
 private UUID id(Authentication a){return(UUID)a.getPrincipal();}
}
