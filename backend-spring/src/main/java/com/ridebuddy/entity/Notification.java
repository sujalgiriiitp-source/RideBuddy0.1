package com.ridebuddy.entity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="notifications")
public class Notification {
    @Id private UUID id; @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="user_id") private User user;
    @Column(nullable=false,length=40) private String type; @Column(nullable=false,length=160) private String title; @Column(nullable=false,length=500) private String body;
    @Column(name="data_json",nullable=false) private String dataJson="{}"; @Column(name="is_read",nullable=false) private boolean read;
    @Column(name="created_at",nullable=false) private Instant createdAt;
    protected Notification() {}
    public Notification(User user,String type,String title,String body){this.id=UUID.randomUUID();this.user=user;this.type=type;this.title=title;this.body=body;this.createdAt=Instant.now();}
    public UUID getId(){return id;} public UUID getUserId(){return user.getId();} public String getType(){return type;} public String getTitle(){return title;} public String getBody(){return body;} public boolean isRead(){return read;} public Instant getCreatedAt(){return createdAt;} public void markRead(){read=true;}
}
