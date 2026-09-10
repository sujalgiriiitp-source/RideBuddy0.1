package com.ridebuddy.service;
import com.ridebuddy.dto.AuthDtos.*;
import com.ridebuddy.entity.*;
import com.ridebuddy.exception.ApiException;
import com.ridebuddy.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
@Service
public class UserService {
    private final UserRepository users; private final PasswordEncoder encoder;
    public UserService(UserRepository users, PasswordEncoder encoder) { this.users = users; this.encoder = encoder; }
    @Transactional public User register(RegisterRequest request) {
        if (users.existsByEmailIgnoreCase(request.email())) throw new ApiException(HttpStatus.CONFLICT, "EMAIL_IN_USE", "Email is already in use");
        Role role = request.role() == null ? Role.USER : request.role();
        if (role == Role.ADMIN) throw new ApiException(HttpStatus.FORBIDDEN, "INVALID_ROLE", "Admin accounts cannot be self-registered");
        return users.save(new User(request.name().trim(), request.email().trim().toLowerCase(), encoder.encode(request.password()), role, request.phone()));
    }
    public User authenticate(LoginRequest request) {
        User user = users.findByEmailIgnoreCase(request.email()).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password"));
        if (!encoder.matches(request.password(), user.getPasswordHash())) throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password");
        return user;
    }
    public java.util.Optional<User> findByEmail(String email) { return users.findByEmailIgnoreCase(email); }
    @Transactional public void verify(User user) { user.verifyEmail(); }
    @Transactional public void updatePassword(User user, String password) { user.setPasswordHash(encoder.encode(password)); }
    public User get(UUID id) { return users.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found")); }
    public UserResponse response(User u) { return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getPhone(), u.getVehicleBrand(), u.getVehicleModel(), u.getCreatedAt()); }
}
