package com.ridebuddy.repository;
import com.ridebuddy.entity.AccountToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AccountTokenRepository extends JpaRepository<AccountToken,UUID>{Optional<AccountToken> findByTokenHashAndTokenType(String hash,String type);}
