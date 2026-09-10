package com.ridebuddy.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {
    @Id private UUID id;
    @Column(nullable = false, length = 120) private String name;
    @Column(nullable = false, unique = true, length = 254) private String email;
    @Column(name = "password_hash", nullable = false) private String passwordHash;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Role role = Role.USER;
    private String phone;
    @Column(name = "vehicle_brand") private String vehicleBrand;
    @Column(name = "vehicle_model") private String vehicleModel;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    protected User() {}
    public User(String name, String email, String passwordHash, Role role, String phone) {
        this.id = UUID.randomUUID(); this.name = name; this.email = email; this.passwordHash = passwordHash;
        this.role = role; this.phone = phone; this.createdAt = Instant.now(); this.updatedAt = this.createdAt;
    }
    @PreUpdate void touch() { updatedAt = Instant.now(); }
    public UUID getId() { return id; } public String getName() { return name; } public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; } public Role getRole() { return role; } public String getPhone() { return phone; }
    public String getVehicleBrand() { return vehicleBrand; } public String getVehicleModel() { return vehicleModel; } public Instant getCreatedAt() { return createdAt; }
    public void updateProfile(String name, String phone, String vehicleBrand, String vehicleModel) {
        this.name = name; this.phone = phone; this.vehicleBrand = vehicleBrand; this.vehicleModel = vehicleModel;
    }
}
