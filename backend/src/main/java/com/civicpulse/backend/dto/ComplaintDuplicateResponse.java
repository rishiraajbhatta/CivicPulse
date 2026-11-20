package com.civicpulse.backend.dto;

import com.civicpulse.backend.entity.DuplicateReviewStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public class ComplaintDuplicateResponse {

    private UUID id;

    private ComplaintResponse complaint;

    private ComplaintResponse possibleDuplicate;

    private Double similarityScore;

    private Double distanceMeters;

    private DuplicateReviewStatus reviewStatus;

    private LocalDateTime createdAt;

    private LocalDateTime reviewedAt;

    public ComplaintDuplicateResponse() {
    }

    public ComplaintDuplicateResponse(
            UUID id,
            ComplaintResponse complaint,
            ComplaintResponse possibleDuplicate,
            Double similarityScore,
            Double distanceMeters,
            DuplicateReviewStatus reviewStatus,
            LocalDateTime createdAt,
            LocalDateTime reviewedAt
    ) {
        this.id = id;
        this.complaint = complaint;
        this.possibleDuplicate = possibleDuplicate;
        this.similarityScore = similarityScore;
        this.distanceMeters = distanceMeters;
        this.reviewStatus = reviewStatus;
        this.createdAt = createdAt;
        this.reviewedAt = reviewedAt;
    }

    public UUID getId() {
        return id;
    }

    public ComplaintResponse getComplaint() {
        return complaint;
    }

    public ComplaintResponse getPossibleDuplicate() {
        return possibleDuplicate;
    }

    public Double getSimilarityScore() {
        return similarityScore;
    }

    public Double getDistanceMeters() {
        return distanceMeters;
    }

    public DuplicateReviewStatus getReviewStatus() {
        return reviewStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }
}
