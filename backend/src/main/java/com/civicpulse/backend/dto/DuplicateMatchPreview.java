package com.civicpulse.backend.dto;

import com.civicpulse.backend.entity.ComplaintCategory;
import com.civicpulse.backend.entity.ComplaintStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record DuplicateMatchPreview(
    UUID id,
    String complaintCode,
    ComplaintCategory category,
    String description,
    String address,
    ComplaintStatus status,
    int upvoteCount,
    double distanceMeters,
    double similarityScore,
    LocalDateTime createdAt
) {}