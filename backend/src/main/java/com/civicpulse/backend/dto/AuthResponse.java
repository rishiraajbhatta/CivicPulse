package com.civicpulse.backend.dto;

import java.util.UUID;

public record AuthResponse(
    String token,
    UUID id,
    String fullName,
    String email,
    String role
) {
}