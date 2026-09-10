package com.ridebuddy.repository;
import com.ridebuddy.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface RatingRepository extends JpaRepository<Rating,UUID>{List<Rating> findByRatedUser_IdOrderByCreatedAtDesc(UUID userId);boolean existsByRide_IdAndRater_IdAndRatedUser_Id(UUID rideId,UUID raterId,UUID ratedUserId);}
