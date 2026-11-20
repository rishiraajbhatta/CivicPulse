package com.civicpulse.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "complaint_duplicates",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_complaint_duplicate_pair",
            columnNames = {
                "complaint_id",
                "possible_duplicate_id"
            }
        )
    }
)
public class ComplaintDuplicate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // The newly submitted complaint.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    // The existing complaint that may be a duplicate.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "possible_duplicate_id", nullable = false)
    private Complaint possibleDuplicate;

    // Description similarity score between 0 and 1.
    @Column(nullable = false)
    private Double similarityScore;

    // Geographic distance between the two complaints.
    @Column(nullable = false)
    private Double distanceMeters;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private DuplicateReviewStatus reviewStatus =
        DuplicateReviewStatus.PENDING;

    // Moderator who reviewed this potential duplicate.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by_moderator_id")
    private Moderator reviewedBy;

    private LocalDateTime reviewedAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public ComplaintDuplicate() {
    }

    public UUID getId() {
        return id;
    }

    public Complaint getComplaint() {
        return complaint;
    }

    public void setComplaint(Complaint complaint) {
        this.complaint = complaint;
    }

    public Complaint getPossibleDuplicate() {
        return possibleDuplicate;
    }

    public void setPossibleDuplicate(Complaint possibleDuplicate) {
        this.possibleDuplicate = possibleDuplicate;
    }

    public Double getSimilarityScore() {
        return similarityScore;
    }

    public void setSimilarityScore(Double similarityScore) {
        this.similarityScore = similarityScore;
    }

    public Double getDistanceMeters() {
        return distanceMeters;
    }

    public void setDistanceMeters(Double distanceMeters) {
        this.distanceMeters = distanceMeters;
    }

    public DuplicateReviewStatus getReviewStatus() {
        return reviewStatus;
    }

    public void setReviewStatus(DuplicateReviewStatus reviewStatus) {
        this.reviewStatus = reviewStatus;
    }

    public Moderator getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(Moderator reviewedBy) {
        this.reviewedBy = reviewedBy;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}