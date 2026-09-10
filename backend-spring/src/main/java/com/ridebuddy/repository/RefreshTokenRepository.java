package com.ridebuddy.repository;
import com.ridebuddy.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.*;
import jakarta.persistence.LockModeType;
public interface RefreshTokenRepository extends JpaRepository<RefreshToken,UUID>{
 @Lock(LockModeType.PESSIMISTIC_WRITE)
 @Query("select t from RefreshToken t where t.tokenHash = :hash")
 Optional<RefreshToken> findByTokenHash(@Param("hash") String hash);
}
