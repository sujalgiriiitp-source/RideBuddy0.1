package com.ridebuddy.config;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {
    private record Window(long startedAt, int count) {}
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        if (!isLimited(request)) { chain.doFilter(request, response); return; }
        String key = request.getRemoteAddr() + ":" + request.getRequestURI();
        long now = Instant.now().getEpochSecond();
        Window next = windows.compute(key, (ignored, current) -> current == null || now - current.startedAt() >= 60 ? new Window(now, 1) : new Window(current.startedAt(), current.count() + 1));
        int limit = request.getRequestURI().contains("/auth/") ? 20 : 60;
        if (next.count() > limit) { response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value()); response.setContentType("application/json"); response.getWriter().write("{\"success\":false,\"code\":\"RATE_LIMITED\",\"message\":\"Too many requests\"}"); return; }
        chain.doFilter(request, response);
    }
    private boolean isLimited(HttpServletRequest request) { String path = request.getRequestURI(); return path.startsWith("/api/v1/auth/") || path.endsWith("/match"); }
}
