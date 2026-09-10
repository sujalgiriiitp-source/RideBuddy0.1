package com.ridebuddy.controller;
import com.ridebuddy.dto.RatingDtos.*;
import com.ridebuddy.service.RatingService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/v1/ratings")
public class RatingController {
 private final RatingService ratings;
 public RatingController(RatingService ratings){this.ratings=ratings;}
 @PostMapping public ResponseEntity<Response> create(Authentication a,@Valid @RequestBody CreateRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(ratings.create(id(a),r));}
 @GetMapping("/user/{userId}") public List<Response> forUser(@PathVariable UUID userId){return ratings.forUser(userId);}
 private UUID id(Authentication a){return(UUID)a.getPrincipal();}
}
