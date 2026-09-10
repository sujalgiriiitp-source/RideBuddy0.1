package com.ridebuddy.security;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;
@Service
public class JwtService {
    private final SecretKey key; private final long expirationMs;
    public JwtService(@Value("${ridebuddy.jwt.secret}") String secret, @Value("${ridebuddy.jwt.expiration-ms}") long expirationMs) {
        if (secret.length() < 32) throw new IllegalArgumentException("ridebuddy.jwt.secret must be at least 32 characters");
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); this.expirationMs = expirationMs;
    }
    public String issue(UUID userId, String role) { Date now = new Date(); return Jwts.builder().subject(userId.toString()).claim("role", role).issuedAt(now).expiration(new Date(now.getTime() + expirationMs)).signWith(key).compact(); }
    public UUID subject(String token) { return UUID.fromString(Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject()); }
}
