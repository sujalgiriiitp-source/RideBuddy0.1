package com.ridebuddy.entity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="messages")
public class Message {
    @Id private UUID id; @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="conversation_id") private Conversation conversation;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="sender_id") private User sender;
    @Column(name="message_type",nullable=false) private String messageType; @Column(nullable=false,length=4000) private String content; @Column(name="created_at",nullable=false) private Instant createdAt;
    protected Message() {}
    public Message(Conversation conversation,User sender,String type,String content){this.id=UUID.randomUUID();this.conversation=conversation;this.sender=sender;this.messageType=type;this.content=content;this.createdAt=Instant.now();}
    public UUID getId(){return id;} public UUID getConversationId(){return conversation.getId();} public UUID getSenderId(){return sender.getId();} public String getMessageType(){return messageType;} public String getContent(){return content;} public Instant getCreatedAt(){return createdAt;}
}
