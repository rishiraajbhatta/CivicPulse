package com.civicpulse.backend.dto;

import java.util.UUID;

public record UpvoteResponse(
    UUID complaintId,
    String complaintCode,
    int upvoteCount,
    String message
) {}