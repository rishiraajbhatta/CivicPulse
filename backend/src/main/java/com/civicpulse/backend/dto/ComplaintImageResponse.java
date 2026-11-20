package com.civicpulse.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ComplaintImageResponse(
    UUID id,
    String imageUrl,
    String imageType,
    String caption,
    LocalDateTime uploadedAt
) {}