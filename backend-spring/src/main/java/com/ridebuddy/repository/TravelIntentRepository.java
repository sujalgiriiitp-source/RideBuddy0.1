package com.ridebuddy.repository;
import com.ridebuddy.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface TravelIntentRepository extends JpaRepository<TravelIntent, UUID> { List<TravelIntent> findByUserIdOrderByCreatedAtDesc(UUID userId); }
