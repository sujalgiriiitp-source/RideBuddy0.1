package com.ridebuddy.controller;
import com.ridebuddy.dto.IntentDtos.*;
import com.ridebuddy.dto.IntentDtos;
import com.ridebuddy.service.IntentService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;
@RestController @RequestMapping("/api/v1/intents")
public class IntentController {
    private final IntentService intents;
    public IntentController(IntentService intents) { this.intents = intents; }
    @PostMapping public ResponseEntity<Response> create(Authentication a, @Valid @RequestBody CreateRequest r) { return ResponseEntity.status(HttpStatus.CREATED).body(intents.create(id(a), r)); }
    @GetMapping public List<Response> mine(Authentication a) { return intents.mine(id(a)); }
    @GetMapping("/{id}/match") public List<IntentDtos.MatchResponse> match(Authentication a, @PathVariable UUID id) { return intents.match(id(a), id); }
    private UUID id(Authentication a) { return (UUID) a.getPrincipal(); }
}
