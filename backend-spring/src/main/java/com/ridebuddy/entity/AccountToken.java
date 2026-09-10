package com.ridebuddy.entity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="account_tokens")
public class AccountToken {
 @Id private UUID id; @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id") private User user;
 @Column(name="token_hash",nullable=false,unique=true) private String tokenHash; @Column(name="token_type",nullable=false) private String tokenType;
 @Column(name="expires_at",nullable=false) private Instant expiresAt; @Column(name="used_at") private Instant usedAt; @Column(name="created_at",nullable=false) private Instant createdAt;
 protected AccountToken(){}
 public AccountToken(User user,String hash,String type,Instant expiresAt){this.id=UUID.randomUUID();this.user=user;this.tokenHash=hash;this.tokenType=type;this.expiresAt=expiresAt;this.createdAt=Instant.now();}
 public User getUser(){return user;} public boolean active(){return usedAt==null&&expiresAt.isAfter(Instant.now());} public void use(){usedAt=Instant.now();}
}
