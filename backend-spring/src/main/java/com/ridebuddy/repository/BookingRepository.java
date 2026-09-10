package com.ridebuddy.repository;
import com.ridebuddy.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    Optional<Booking> findByRide_IdAndUser_Id(UUID rideId, UUID userId);
    List<Booking> findByUser_IdOrderByCreatedAtDesc(UUID userId);
}
