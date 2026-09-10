package com.ridebuddy.service;

import com.ridebuddy.entity.*;
import com.ridebuddy.repository.*;
import com.ridebuddy.security.JwtService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TokenServiceTest {
    @Mock RefreshTokenRepository refreshTokens;
    @Mock AccountTokenRepository accountTokens;
    @Mock UserRepository users;
    private JwtService jwt;
    private EmailService email;
    private TokenService service;

    @BeforeEach
    void setUp() {
        jwt = new JwtService("test-secret-that-is-at-least-32-characters", 900_000);
        email = new EmailService(false, "test@example.com", new ObjectProvider<JavaMailSender>() {
            public JavaMailSender getObject() { return null; }
            public JavaMailSender getObject(Object... args) { return null; }
            public JavaMailSender getIfAvailable() { return null; }
            public JavaMailSender getIfAvailable(java.util.function.Supplier<JavaMailSender> supplier) { return null; }
            public JavaMailSender getIfUnique() { return null; }
            public JavaMailSender getIfUnique(java.util.function.Supplier<JavaMailSender> supplier) { return null; }
        });
        service = new TokenService(refreshTokens, accountTokens, users, jwt, email);
    }

    @Test
    void issuesOpaqueRefreshTokenAndStoresOnlyItsHash() {
        User user = new User("Asha", "asha@example.com", "hash", Role.USER, null);

        String token = service.issueRefresh(user);

        assertFalse(token.isBlank());
        assertNotEquals(token, token.replaceAll("[a-zA-Z0-9_-]", ""));
        verify(refreshTokens).save(argThat(saved -> saved.getUser() == user));
    }

    @Test
    void rotatesActiveRefreshTokenAndRevokesTheOriginal() {
        User user = new User("Asha", "asha@example.com", "hash", Role.USER, null);
        RefreshToken stored = new RefreshToken(user, "hash", Instant.now().plusSeconds(300));
        when(refreshTokens.findByTokenHash(any())).thenReturn(Optional.of(stored));

        TokenService.Rotation rotation = service.rotate("presented-token");

        assertSame(user, rotation.user());
        assertFalse(rotation.refreshToken().isBlank());
        assertNotSame(rotation.refreshToken(), "presented-token");
        verify(refreshTokens).save(any(RefreshToken.class));
    }

    @Test
    void rejectsExpiredRefreshToken() {
        User user = new User("Asha", "asha@example.com", "hash", Role.USER, null);
        RefreshToken expired = new RefreshToken(user, "hash", Instant.now().minusSeconds(1));
        when(refreshTokens.findByTokenHash(any())).thenReturn(Optional.of(expired));

        assertThrows(RuntimeException.class, () -> service.rotate("expired"));
        verify(refreshTokens, never()).save(any());
    }

    @Test
    void accountTokenCanOnlyBeConsumedOnce() {
        User user = new User("Asha", "asha@example.com", "hash", Role.USER, null);
        AccountToken token = new AccountToken(user, "hash", "PASSWORD_RESET", Instant.now().plusSeconds(300));
        when(accountTokens.findByTokenHashAndTokenType(any(), eq("PASSWORD_RESET"))).thenReturn(Optional.of(token));

        assertSame(user, service.consumeAccount("presented", "PASSWORD_RESET"));
        assertFalse(token.active());
    }
}
