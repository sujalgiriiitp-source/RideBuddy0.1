package com.ridebuddy.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "rides")
public class Ride {
    @Id private UUID id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "owner_id") private User owner;
    @Column(nullable = false) private String source;
    @Column(nullable = false) private String destination;
    @Column(name = "departure_time", nullable = false) private Instant departureTime;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal price;
    @Column(name = "total_seats", nullable = false) private int totalSeats;
    @Column(name = "available_seats", nullable = false) private int availableSeats;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private RideStatus status = RideStatus.OPEN;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    protected Ride() {}
    public Ride(User owner, String source, String destination, Instant departureTime, BigDecimal price, int seats) {
        this.id = UUID.randomUUID(); this.owner = owner; this.source = source; this.destination = destination;
        this.departureTime = departureTime; this.price = price; this.totalSeats = seats; this.availableSeats = seats;
        this.createdAt = Instant.now(); this.updatedAt = this.createdAt;
    }
    @PreUpdate void touch() { updatedAt = Instant.now(); }
    public UUID getId() { return id; } public User getOwner() { return owner; } public String getSource() { return source; }
    public String getDestination() { return destination; } public Instant getDepartureTime() { return departureTime; }
    public BigDecimal getPrice() { return price; } public int getTotalSeats() { return totalSeats; }
    public int getAvailableSeats() { return availableSeats; } public RideStatus getStatus() { return status; }
    public void update(String source, String destination, Instant departureTime, BigDecimal price, int seats) {
        int booked = totalSeats - availableSeats; if (seats < booked) throw new IllegalArgumentException("Seats cannot be below booked seats");
        this.source = source; this.destination = destination; this.departureTime = departureTime; this.price = price;
        this.totalSeats = seats; this.availableSeats = seats - booked;
    }
    public void cancel() { status = RideStatus.CANCELLED; }
    public void reserve(int seats) { if (status != RideStatus.OPEN) throw new IllegalStateException("Ride is not open"); if (seats > availableSeats) throw new IllegalStateException("Not enough seats"); availableSeats -= seats; }
    public void release(int seats) { availableSeats = Math.min(totalSeats, availableSeats + seats); }
}
