package com.civicpulse.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handle invalid business requests.
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(
            IllegalArgumentException exception
    ) {

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(Map.of(
                "error", exception.getMessage()
            ));
    }

    // Handle unauthorized access to another user's resources.
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(
            AccessDeniedException exception
    ) {

        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(Map.of(
                "error", exception.getMessage()
            ));
    }

    // Handle request validation failures.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(
            MethodArgumentNotValidException exception
    ) {

        String message = exception.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(error ->
                error.getField() + ": " + error.getDefaultMessage()
            )
            .findFirst()
            .orElse("Invalid request data.");

        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(Map.of(
                "error", message
            ));
    }
}
