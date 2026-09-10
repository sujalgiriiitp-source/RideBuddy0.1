package com.ridebuddy.controller;
import com.ridebuddy.dto.AuthDtos.*;
import com.ridebuddy.service.*;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/auth")
public class AuthController {
 private final UserService users; private final TokenService tokens;
 public AuthController(UserService users,TokenService tokens){this.users=users;this.tokens=tokens;}
 @PostMapping({"/register","/signup"}) public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest r){var u=users.register(r);tokens.issueAndSendAccount(u,"EMAIL_VERIFICATION");return ResponseEntity.status(HttpStatus.CREATED).body(auth(u));}
 @PostMapping("/login") public AuthResponse login(@Valid @RequestBody LoginRequest r){return auth(users.authenticate(r));}
 @PostMapping("/refresh") public AuthResponse refresh(@Valid @RequestBody RefreshRequest r){var rotation=tokens.rotate(r.refreshToken());return new AuthResponse(tokens.access(rotation.user()),rotation.refreshToken(),users.response(rotation.user()));}
 @PostMapping("/logout") public TokenMessage logout(@Valid @RequestBody RefreshRequest r){tokens.revoke(r.refreshToken());return new TokenMessage("Logged out");}
 @PostMapping("/verify-email") public TokenMessage verify(@RequestParam String token){users.verify(tokens.consumeAccount(token,"EMAIL_VERIFICATION"));return new TokenMessage("Email verified");}
 @PostMapping("/forgot-password") public TokenMessage forgot(@Valid @RequestBody ForgotPasswordRequest r){var user=users.findByEmail(r.email());tokens.issueAndSendAccount(user,"PASSWORD_RESET");return new TokenMessage("If the account exists, reset instructions will be sent");}
 @PostMapping("/reset-password") public TokenMessage reset(@Valid @RequestBody ResetPasswordRequest r){var user=tokens.consumeAccount(r.token(),"PASSWORD_RESET");users.updatePassword(user,r.password());return new TokenMessage("Password reset");}
 private AuthResponse auth(com.ridebuddy.entity.User u){return new AuthResponse(tokens.access(u),tokens.issueRefresh(u),users.response(u));}
}
