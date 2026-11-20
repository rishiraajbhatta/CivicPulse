package com.civicpulse.backend.dto;

import java.util.UUID;

public record DepartmentResponse(
    UUID id,
    String name,
    String description,
    String contactEmail,
    String contactPhone
) {
}