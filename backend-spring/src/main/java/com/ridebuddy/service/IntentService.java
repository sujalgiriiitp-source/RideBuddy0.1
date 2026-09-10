package com.ridebuddy.service;
import com.ridebuddy.algorithm.RideMatchingAlgorithm;
import com.ridebuddy.dto.*;
import com.ridebuddy.dto.IntentDtos.*;
import com.ridebuddy.entity.*;
import com.ridebuddy.exception.ApiException;
import com.ridebuddy.repository.*;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.*;
@Service
public class IntentService {
    private final TravelIntentRepository intents; private final RideRepository rides; private final UserService users; private final RideService rideService;
    public IntentService(TravelIntentRepository intents, RideRepository rides, UserService users, RideService rideService) { this.intents = intents; this.rides = rides; this.users = users; this.rideService = rideService; }
    @Transactional public Response create(UUID userId, CreateRequest request) { return response(intents.save(new TravelIntent(users.get(userId), request.source().trim(), request.destination().trim(), request.departureTime()))); }
    public List<Response> mine(UUID userId) { return intents.findByUser_IdOrderByCreatedAtDesc(userId).stream().map(this::response).toList(); }
    public List<IntentDtos.MatchResponse> match(UUID userId, UUID intentId) {
        TravelIntent intent = intents.findById(intentId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "INTENT_NOT_FOUND", "Travel intent not found"));
        if (!intent.getUser().getId().equals(userId)) throw new ApiException(HttpStatus.FORBIDDEN, "INTENT_ACCESS_DENIED", "Only the intent owner can request matches");
        List<Ride> candidates = rides.search(RideStatus.OPEN, null, null, intent.getDepartureTime().minusSeconds(7200), intent.getDepartureTime().plusSeconds(7200), Pageable.ofSize(100)).getContent();
        return RideMatchingAlgorithm.rank(intent, candidates).stream().map(s -> new IntentDtos.MatchResponse(s.ride().getId(), s.score(), rideService.response(s.ride()))).toList();
    }
    private Response response(TravelIntent i) { return new Response(i.getId(), i.getUser().getId(), i.getSource(), i.getDestination(), i.getDepartureTime(), i.getStatus().name()); }
}
