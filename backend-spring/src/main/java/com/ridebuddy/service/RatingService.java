package com.ridebuddy.service;
import com.ridebuddy.dto.RatingDtos.*;
import com.ridebuddy.entity.*;
import com.ridebuddy.exception.ApiException;
import com.ridebuddy.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
@Service public class RatingService {
 private final RatingRepository ratings; private final UserService users; private final RideRepository rides; private final BookingRepository bookings;
 public RatingService(RatingRepository ratings,UserService users,RideRepository rides,BookingRepository bookings){this.ratings=ratings;this.users=users;this.rides=rides;this.bookings=bookings;}
 @Transactional public Response create(UUID raterId,CreateRequest r){Ride ride=rides.findById(r.rideId()).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"RIDE_NOT_FOUND","Ride not found"));if(raterId.equals(r.ratedUserId()))throw new ApiException(HttpStatus.BAD_REQUEST,"INVALID_RATING","A user cannot rate themselves");boolean isOwner=ride.getOwner().getId().equals(raterId);boolean isParticipant=bookings.findByRide_IdAndUser_Id(r.rideId(),raterId).filter(b->b.getStatus()==BookingStatus.CONFIRMED).isPresent();if(!isOwner&&!isParticipant)throw new ApiException(HttpStatus.FORBIDDEN,"RATING_ACCESS_DENIED","You must participate in the ride to rate it");if(!ratings.existsByRide_IdAndRater_IdAndRatedUser_Id(r.rideId(),raterId,r.ratedUserId()))return response(ratings.save(new Rating(ride,users.get(raterId),users.get(r.ratedUserId()),r.stars(),r.review()==null?"":r.review().trim())));throw new ApiException(HttpStatus.CONFLICT,"DUPLICATE_RATING","Rating already exists");}
 public List<Response> forUser(UUID userId){return ratings.findByRatedUser_IdOrderByCreatedAtDesc(userId).stream().map(this::response).toList();}
 private Response response(Rating r){return new Response(r.getId(),r.getRideId(),r.getRaterId(),r.getRatedUserId(),r.getStars(),r.getReview(),r.getCreatedAt());}
}
