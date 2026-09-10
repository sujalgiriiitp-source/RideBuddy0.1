package com.ridebuddy.controller;
import com.ridebuddy.dto.AuthDtos.UserResponse;
import com.ridebuddy.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
@RestController @RequestMapping("/api/v1/users")
public class UserController {
    private final UserService users;
    public UserController(UserService users) { this.users = users; }
    @GetMapping({"/me","/profile"}) public UserResponse me(Authentication authentication) { return users.response(users.get((UUID) authentication.getPrincipal())); }
}
