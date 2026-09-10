package com.ridebuddy.controller;
import com.ridebuddy.dto.RideDtos.*;
import com.ridebuddy.service.RideService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.UUID;
@RestController @RequestMapping("/api/v1/rides")
public class RideController {
    private final RideService rides;
    public RideController(RideService rides) { this.rides = rides; }
    @PostMapping public ResponseEntity<Response> create(Authentication a, @Valid @RequestBody CreateRequest r) { return ResponseEntity.status(HttpStatus.CREATED).body(rides.create(id(a), r)); }
    @GetMapping public Page<Response> list(@RequestParam(required=false) String source, @RequestParam(required=false) String destination, @RequestParam(required=false) Instant from, @RequestParam(required=false) Instant to, @PageableDefault(size=20, sort="departureTime") Pageable page) { return rides.search(source, destination, from, to, page); }
    @GetMapping("/{id}") public Response get(@PathVariable UUID id) { return rides.get(id); }
    @PutMapping("/{id}") public Response update(Authentication a, @PathVariable UUID id, @Valid @RequestBody UpdateRequest r) { return rides.update(id(a), id, r); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void cancel(Authentication a, @PathVariable UUID id) { rides.cancel(id(a), id); }
    @PostMapping("/{id}/join") public ResponseEntity<?> join(Authentication a, @PathVariable UUID id, @Valid @RequestBody JoinRequest r) { return ResponseEntity.status(HttpStatus.CREATED).body(rides.book(id(a), id, r.seats())); }
    @DeleteMapping("/{id}/leave") @ResponseStatus(HttpStatus.NO_CONTENT) public void leave(Authentication a, @PathVariable UUID id) { rides.leave(id(a), id); }
    private UUID id(Authentication a) { return (UUID) a.getPrincipal(); }
}
