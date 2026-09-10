package com.ridebuddy.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "bookings", uniqueConstraints = @UniqueConstraint(columnNames = {"ride_id", "user_id"}))
public class Booking {
    @Id private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "ride_id") private Ride ride;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id") private User user;
    @Column(nullable = false) private int seats;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private BookingStatus status = BookingStatus.CONFIRMED;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    protected Booking() {}
    public Booking(Ride ride, User user, int seats) { this.id = UUID.randomUUID(); this.ride = ride; this.user = user; this.seats = seats; this.createdAt = Instant.now(); this.updatedAt = createdAt; }
    public UUID getId() { return id; } public Ride getRide() { return ride; } public User getUser() { return user; } public int getSeats() { return seats; } public BookingStatus getStatus() { return status; }
    public void cancel() { status = BookingStatus.CANCELLED; updatedAt = Instant.now(); }
}
