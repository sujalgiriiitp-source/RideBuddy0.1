package com.ridebuddy.service;
import com.ridebuddy.dto.ProfileDtos.UpdateRequest;
import com.ridebuddy.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
@Service public class ProfileService {
 private final UserService users;
 public ProfileService(UserService users){this.users=users;}
 @Transactional public User update(UUID id,UpdateRequest r){User u=users.get(id);u.updateProfile(r.name().trim(),r.phone(),r.vehicleBrand(),r.vehicleModel());return u;}
}
