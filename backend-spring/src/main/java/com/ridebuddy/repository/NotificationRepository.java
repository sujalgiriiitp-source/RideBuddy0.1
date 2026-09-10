package com.ridebuddy.repository;
import com.ridebuddy.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface NotificationRepository extends JpaRepository<Notification,UUID>{List<Notification> findByUser_IdOrderByCreatedAtDesc(UUID userId);Optional<Notification> findByIdAndUser_Id(UUID id,UUID userId);}
