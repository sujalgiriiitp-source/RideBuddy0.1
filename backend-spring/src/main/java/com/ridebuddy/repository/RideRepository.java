package com.ridebuddy.repository;
import com.ridebuddy.entity.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.time.Instant;
import java.util.*;
public interface RideRepository extends JpaRepository<Ride, UUID> {
    @Query("select r from Ride r join fetch r.owner where r.status = :status and (:source is null or lower(r.source) like lower(concat('%', :source, '%'))) and (:destination is null or lower(r.destination) like lower(concat('%', :destination, '%'))) and (:from is null or r.departureTime >= :from) and (:to is null or r.departureTime < :to)")
    Page<Ride> search(@Param("status") RideStatus status, @Param("source") String source, @Param("destination") String destination, @Param("from") Instant from, @Param("to") Instant to, Pageable pageable);
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select r from Ride r where r.id = :id") Optional<Ride> findByIdForUpdate(@Param("id") UUID id);
}
