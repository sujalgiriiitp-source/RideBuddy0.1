package com.ridebuddy.exception;
import com.ridebuddy.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ApiException.class) ResponseEntity<ErrorResponse> api(ApiException e, HttpServletRequest r) { return build(e.getStatus(), e.getCode(), e.getMessage(), r, List.of()); }
    @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<ErrorResponse> validation(MethodArgumentNotValidException e, HttpServletRequest r) {
        List<String> details = e.getBindingResult().getFieldErrors().stream().map(x -> x.getField() + ": " + x.getDefaultMessage()).collect(Collectors.toList());
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Request validation failed", r, details);
    }
    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class}) ResponseEntity<ErrorResponse> business(RuntimeException e, HttpServletRequest r) { return build(HttpStatus.BAD_REQUEST, "INVALID_REQUEST", e.getMessage(), r, List.of()); }
    @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<ErrorResponse> conflict(DataIntegrityViolationException e, HttpServletRequest r) { return build(HttpStatus.CONFLICT, "DUPLICATE_RESOURCE", "The requested resource conflicts with existing data", r, List.of()); }
    @ExceptionHandler(Exception.class) ResponseEntity<ErrorResponse> unexpected(Exception e, HttpServletRequest r) { return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "An unexpected error occurred", r, List.of()); }
    private ResponseEntity<ErrorResponse> build(HttpStatus status, String code, String message, HttpServletRequest r, List<String> details) { return ResponseEntity.status(status).body(new ErrorResponse(false, code, message, Instant.now(), r.getRequestURI(), details)); }
}
