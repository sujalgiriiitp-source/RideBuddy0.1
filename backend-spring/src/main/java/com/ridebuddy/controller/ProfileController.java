package com.ridebuddy.controller;
import com.ridebuddy.dto.AuthDtos.UserResponse;
import com.ridebuddy.dto.ProfileDtos.UpdateRequest;
import com.ridebuddy.service.*;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
@RestController @RequestMapping("/api/v1/users")
public class ProfileController {
 private final ProfileService profiles; private final UserService users;
 public ProfileController(ProfileService profiles,UserService users){this.profiles=profiles;this.users=users;}
 @PutMapping("/me") public UserResponse update(Authentication a,@Valid @RequestBody UpdateRequest r){return users.response(profiles.update(id(a),r));}
 private UUID id(Authentication a){return(UUID)a.getPrincipal();}
}
