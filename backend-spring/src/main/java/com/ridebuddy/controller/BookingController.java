package com.ridebuddy.controller;
import com.ridebuddy.dto.BookingDtos.*;
import com.ridebuddy.service.RideService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
import java.util.List;
@RestController @RequestMapping("/api/v1/bookings")
public class BookingController {
 private final RideService rides;
 public BookingController(RideService rides){this.rides=rides;}
 public record CreateRequest(@NotNull UUID rideId,@Min(1) int seats){}
 @PostMapping public ResponseEntity<Response> create(Authentication a,@Valid @RequestBody CreateRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(rides.book(id(a),r.rideId(),r.seats()));}
 @GetMapping({"/my","/my-bookings"}) public List<Response> mine(Authentication a){return rides.bookings(id(a));}
 @GetMapping("/ride/{rideId}/mine") public java.util.Map<String,Object> mineForRide(Authentication a,@PathVariable UUID rideId){return rides.bookingForRide(id(a),rideId);}
 @PostMapping("/ride/{rideId}") public ResponseEntity<Response> createLegacy(Authentication a,@PathVariable UUID rideId,@Valid @RequestBody CreateRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(rides.book(id(a),rideId,r.seats()));}
 @DeleteMapping("/{rideId}") @ResponseStatus(HttpStatus.NO_CONTENT) public void cancel(Authentication a,@PathVariable UUID rideId){rides.leave(id(a),rideId);}
 @PostMapping("/{rideId}/cancel") @ResponseStatus(HttpStatus.NO_CONTENT) public void cancelLegacy(Authentication a,@PathVariable UUID rideId){rides.leave(id(a),rideId);}
 private UUID id(Authentication a){return(UUID)a.getPrincipal();}
}
