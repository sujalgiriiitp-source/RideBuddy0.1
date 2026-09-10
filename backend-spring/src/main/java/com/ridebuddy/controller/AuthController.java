package com.ridebuddy.controller;
import com.ridebuddy.dto.AuthDtos.*;
import com.ridebuddy.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import com.ridebuddy.security.JwtService;
@RestController @RequestMapping("/api/v1/auth")
public class AuthController {
    private final UserService users; private final JwtService jwt;
    public AuthController(UserService users, JwtService jwt) { this.users = users; this.jwt = jwt; }
    @PostMapping("/register") public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest r) { var u = users.register(r); return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(jwt.issue(u.getId(), u.getRole().name()), users.response(u))); }
    @PostMapping("/login") public AuthResponse login(@Valid @RequestBody LoginRequest r) { var u = users.authenticate(r); return new AuthResponse(jwt.issue(u.getId(), u.getRole().name()), users.response(u)); }
}
