package com.ridebuddy.repository;
import com.ridebuddy.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface MessageRepository extends JpaRepository<Message,UUID>{List<Message> findByConversation_IdOrderByCreatedAtAsc(UUID conversationId);}
