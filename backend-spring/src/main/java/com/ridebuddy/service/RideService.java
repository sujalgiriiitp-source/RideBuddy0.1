package com.ridebuddy.service;
import com.ridebuddy.dto.RideDtos.*;
import com.ridebuddy.dto.BookingDtos;
import com.ridebuddy.entity.*;
import com.ridebuddy.exception.ApiException;
import com.ridebuddy.repository.*;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.UUID;
@Service
public class RideService {
    private final RideRepository rides; private final UserService users; private final BookingRepository bookings;
    public RideService(RideRepository rides, UserService users, BookingRepository bookings) { this.rides = rides; this.users = users; this.bookings = bookings; }
    @Transactional public Response create(UUID ownerId, CreateRequest r) { return response(rides.save(new Ride(users.get(ownerId), r.source().trim(), r.destination().trim(), r.departureTime(), r.price(), r.seats()))); }
    public Page<Response> search(String source, String destination, Instant from, Instant to, Pageable page) { return rides.search(RideStatus.OPEN, source, destination, from, to, page).map(this::response); }
    public Response get(UUID id) { return response(rides.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "RIDE_NOT_FOUND", "Ride not found"))); }
    @Transactional public Response update(UUID actor, UUID id, UpdateRequest request) { Ride ride = owned(actor, id); try { ride.update(request.source().trim(), request.destination().trim(), request.departureTime(), request.price(), request.seats()); } catch (IllegalArgumentException e) { throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_RIDE", e.getMessage()); } return response(ride); }
    @Transactional public void cancel(UUID actor, UUID id) { owned(actor, id).cancel(); }
    @Transactional public BookingDtos.Response book(UUID userId, UUID rideId, int seats) {
        Ride ride = rides.findByIdForUpdate(rideId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "RIDE_NOT_FOUND", "Ride not found"));
        if (ride.getOwner().getId().equals(userId)) throw new ApiException(HttpStatus.BAD_REQUEST, "OWNER_CANNOT_BOOK", "Ride owners cannot book their own ride");
        if (bookings.findByRideIdAndUserId(rideId, userId).filter(b -> b.getStatus() == BookingStatus.CONFIRMED).isPresent()) throw new ApiException(HttpStatus.CONFLICT, "DUPLICATE_BOOKING", "User already has an active booking");
        try { ride.reserve(seats); } catch (IllegalStateException e) { throw new ApiException(HttpStatus.BAD_REQUEST, "SEAT_UNAVAILABLE", e.getMessage()); }
        Booking booking = bookings.save(new Booking(ride, users.get(userId), seats));
        return new BookingDtos.Response(booking.getId(), rideId, userId, booking.getSeats(), booking.getStatus());
    }
    @Transactional public void leave(UUID userId, UUID rideId) { Booking booking = bookings.findByRideIdAndUserId(rideId, userId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "BOOKING_NOT_FOUND", "Booking not found")); if (booking.getStatus() == BookingStatus.CONFIRMED) { booking.getRide().release(booking.getSeats()); booking.cancel(); } }
    private Ride owned(UUID actor, UUID id) { Ride ride = rides.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "RIDE_NOT_FOUND", "Ride not found")); if (!ride.getOwner().getId().equals(actor)) throw new ApiException(HttpStatus.FORBIDDEN, "RIDE_ACCESS_DENIED", "Only the ride owner can modify it"); return ride; }
    public Response response(Ride r) { return new Response(r.getId(), r.getOwner().getId(), r.getOwner().getName(), r.getSource(), r.getDestination(), r.getDepartureTime(), r.getPrice(), r.getTotalSeats(), r.getAvailableSeats(), r.getStatus()); }
}
