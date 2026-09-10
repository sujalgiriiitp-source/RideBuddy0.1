package com.ridebuddy.security;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.ridebuddy.repository.UserRepository;
import java.io.IOException;
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwt; private final UserRepository users;
    public JwtAuthenticationFilter(JwtService jwt, UserRepository users) { this.jwt = jwt; this.users = users; }
    @Override protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws ServletException, IOException {
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                var userId = jwt.subject(header.substring(7));
                var user = users.findById(userId).orElseThrow();
                var auth = new UsernamePasswordAuthenticationToken(userId, null, java.util.List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (RuntimeException ignored) { /* Invalid tokens remain unauthenticated and are rejected by security. */ }
        }
        chain.doFilter(req, res);
    }
}
