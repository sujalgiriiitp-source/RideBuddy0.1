package com.ridebuddy.service;
import com.ridebuddy.entity.*;
import com.ridebuddy.exception.ApiException;
import com.ridebuddy.repository.*;
import com.ridebuddy.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
@Service
public class TokenService {
 private final RefreshTokenRepository refreshTokens; private final AccountTokenRepository accountTokens; private final UserRepository users; private final JwtService jwt; private final EmailService email; private final SecureRandom random=new SecureRandom();
 public TokenService(RefreshTokenRepository refreshTokens,AccountTokenRepository accountTokens,UserRepository users,JwtService jwt,EmailService email){this.refreshTokens=refreshTokens;this.accountTokens=accountTokens;this.users=users;this.jwt=jwt;this.email=email;}
 @Transactional public String issueRefresh(User user){String raw=raw();refreshTokens.save(new RefreshToken(user,hash(raw),Instant.now().plus(Duration.ofDays(30))));return raw;}
 @Transactional public Rotation rotate(String raw){RefreshToken token=refreshTokens.findByTokenHash(hash(raw)).filter(RefreshToken::active).orElseThrow(()->new ApiException(HttpStatus.UNAUTHORIZED,"INVALID_REFRESH_TOKEN","Refresh token is invalid or expired"));token.revoke();return new Rotation(token.getUser(),issueRefresh(token.getUser()));}
 @Transactional public void revoke(String raw){refreshTokens.findByTokenHash(hash(raw)).ifPresent(RefreshToken::revoke);}
 @Transactional public String issueAccount(User user,String type){String raw=raw();accountTokens.save(new AccountToken(user,hash(raw),type,Instant.now().plus(Duration.ofHours(1))));return raw;}
 @Transactional public void issueAndSendAccount(User user,String type){email.sendToken(user,type,issueAccount(user,type));}
 @Transactional public User consumeAccount(String raw,String type){AccountToken token=accountTokens.findByTokenHashAndTokenType(hash(raw),type).filter(AccountToken::active).orElseThrow(()->new ApiException(HttpStatus.BAD_REQUEST,"INVALID_ACCOUNT_TOKEN","Token is invalid or expired"));token.use();return token.getUser();}
 public String access(User user){return jwt.issue(user.getId(),user.getRole().name());}
 public record Rotation(User user,String refreshToken){}
 private String raw(){byte[] bytes=new byte[48];random.nextBytes(bytes);return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);}
 private String hash(String value){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));}catch(NoSuchAlgorithmException e){throw new IllegalStateException(e);}}
}
