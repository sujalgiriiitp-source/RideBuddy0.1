package com.ridebuddy.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "travel_intents")
public class TravelIntent {
    @Id private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id") private User user;
    @Column(nullable = false) private String source;
    @Column(nullable = false) private String destination;
    @Column(name = "departure_time", nullable = false) private Instant departureTime;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private IntentStatus status = IntentStatus.OPEN;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    protected TravelIntent() {}
    public TravelIntent(User user, String source, String destination, Instant departureTime) { this.id = UUID.randomUUID(); this.user = user; this.source = source; this.destination = destination; this.departureTime = departureTime; this.createdAt = Instant.now(); this.updatedAt = createdAt; }
    public UUID getId() { return id; } public User getUser() { return user; } public String getSource() { return source; } public String getDestination() { return destination; } public Instant getDepartureTime() { return departureTime; } public IntentStatus getStatus() { return status; }
}
