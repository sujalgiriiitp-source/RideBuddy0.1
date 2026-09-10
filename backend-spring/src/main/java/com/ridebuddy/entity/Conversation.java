package com.ridebuddy.entity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.*;
@Entity @Table(name="conversations")
public class Conversation {
    @Id private UUID id; @ManyToMany(fetch=FetchType.LAZY) @JoinTable(name="conversation_participants",joinColumns=@JoinColumn(name="conversation_id"),inverseJoinColumns=@JoinColumn(name="user_id")) private Set<User> participants=new HashSet<>();
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="ride_id") private Ride ride;
    @Column(name="created_at",nullable=false) private Instant createdAt; @Column(name="updated_at",nullable=false) private Instant updatedAt;
    protected Conversation() {}
    public Conversation(Set<User> participants,Ride ride){this.id=UUID.randomUUID();this.participants=participants;this.ride=ride;this.createdAt=Instant.now();this.updatedAt=createdAt;}
    public UUID getId(){return id;} public Set<User> getParticipants(){return participants;} public Ride getRide(){return ride;}
}
