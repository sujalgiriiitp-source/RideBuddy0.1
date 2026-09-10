package com.ridebuddy.service;
import com.ridebuddy.dto.ChatDtos.*;
import com.ridebuddy.entity.*;
import com.ridebuddy.exception.ApiException;
import com.ridebuddy.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
@Service public class ChatService {
 private final ConversationRepository conversations; private final MessageRepository messages; private final UserService users; private final RideRepository rides;
 public ChatService(ConversationRepository conversations,MessageRepository messages,UserService users,RideRepository rides){this.conversations=conversations;this.messages=messages;this.users=users;this.rides=rides;}
 @Transactional public ConversationResponse start(UUID actor,StartRequest r){Set<User> participants=new HashSet<>(List.of(users.get(actor),users.get(r.participantId())));Ride ride=r.rideId()==null?null:rides.findById(r.rideId()).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"RIDE_NOT_FOUND","Ride not found"));Conversation c=conversations.save(new Conversation(participants,ride));return response(c);}
 public List<ConversationResponse> conversations(UUID userId){return conversations.findDistinctByParticipants_IdOrderByUpdatedAtDesc(userId).stream().map(this::response).toList();}
 public List<MessageResponse> messages(UUID actor,UUID conversationId){Conversation c=authorized(actor,conversationId);return messages.findByConversation_IdOrderByCreatedAtAsc(c.getId()).stream().map(this::message).toList();}
 @Transactional public MessageResponse send(UUID actor,SendRequest r){Conversation c=authorized(actor,r.conversationId());return message(messages.save(new Message(c,users.get(actor),r.messageType()==null?"text":r.messageType(),r.content().trim())));}
 private Conversation authorized(UUID actor,UUID id){Conversation c=conversations.findById(id).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"CONVERSATION_NOT_FOUND","Conversation not found"));if(c.getParticipants().stream().noneMatch(u->u.getId().equals(actor)))throw new ApiException(HttpStatus.FORBIDDEN,"CHAT_ACCESS_DENIED","You are not a conversation participant");return c;}
 private ConversationResponse response(Conversation c){return new ConversationResponse(c.getId(),c.getRide()==null?null:c.getRide().getId(),c.getParticipants().size());}
 private MessageResponse message(Message m){return new MessageResponse(m.getId(),m.getConversationId(),m.getSenderId(),m.getMessageType(),m.getContent(),m.getCreatedAt());}
}
