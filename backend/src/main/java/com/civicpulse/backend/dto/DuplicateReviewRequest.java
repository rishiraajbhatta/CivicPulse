package com.civicpulse.backend.dto;

import com.civicpulse.backend.entity.DuplicateReviewStatus;
import jakarta.validation.constraints.NotNull;

public class DuplicateReviewRequest {

    @NotNull(message = "Review status is required")
    private DuplicateReviewStatus reviewStatus;

    public DuplicateReviewRequest() {
    }

    public DuplicateReviewStatus getReviewStatus() {
        return reviewStatus;
    }

    public void setReviewStatus(DuplicateReviewStatus reviewStatus) {
        this.reviewStatus = reviewStatus;
    }
}
