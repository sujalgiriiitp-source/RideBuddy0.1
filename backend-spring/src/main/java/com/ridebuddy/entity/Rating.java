package com.ridebuddy.entity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="ratings", uniqueConstraints=@UniqueConstraint(columnNames={"ride_id","rater_id","rated_user_id"}))
public class Rating {
    @Id private UUID id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="ride_id") private Ride ride;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="rater_id") private User rater;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="rated_user_id") private User ratedUser;
    @Column(nullable=false) private int stars; @Column(nullable=false, length=500) private String review;
    @Column(name="created_at", nullable=false) private Instant createdAt; @Column(name="updated_at", nullable=false) private Instant updatedAt;
    protected Rating() {}
    public Rating(Ride ride, User rater, User ratedUser, int stars, String review) { this.id=UUID.randomUUID(); this.ride=ride; this.rater=rater; this.ratedUser=ratedUser; this.stars=stars; this.review=review; this.createdAt=Instant.now(); this.updatedAt=createdAt; }
    public UUID getId(){return id;} public UUID getRideId(){return ride.getId();} public UUID getRaterId(){return rater.getId();} public UUID getRatedUserId(){return ratedUser.getId();} public int getStars(){return stars;} public String getReview(){return review;} public Instant getCreatedAt(){return createdAt;}
}
