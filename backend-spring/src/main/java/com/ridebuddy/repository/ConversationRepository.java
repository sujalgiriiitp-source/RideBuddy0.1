package com.ridebuddy.repository;
import com.ridebuddy.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface ConversationRepository extends JpaRepository<Conversation,UUID>{List<Conversation> findDistinctByParticipants_IdOrderByUpdatedAtDesc(UUID userId);}
