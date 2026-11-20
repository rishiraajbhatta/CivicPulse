package com.civicpulse.backend.repository;

import com.civicpulse.backend.entity.ComplaintDuplicate;
import com.civicpulse.backend.entity.DuplicateReviewStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ComplaintDuplicateRepository
        extends JpaRepository<ComplaintDuplicate, UUID> {

    // Get potential duplicates of a particular complaint.
    List<ComplaintDuplicate> findByComplaint_IdOrderBySimilarityScoreDesc(
        UUID complaintId
    );

    // Find complaints that have been identified as possible duplicates.
    List<ComplaintDuplicate> findByPossibleDuplicate_Id(
        UUID complaintId
    );

    // Check whether a complaint pair already exists.
    boolean existsByComplaint_IdAndPossibleDuplicate_Id(
        UUID complaintId,
        UUID possibleDuplicateId
    );

    // Get all duplicate matches awaiting moderator review.
    List<ComplaintDuplicate> findByReviewStatusOrderByCreatedAtDesc(
        DuplicateReviewStatus reviewStatus
    );

    // Get all duplicate matches for a complaint and review status.
    List<ComplaintDuplicate> findByComplaint_IdAndReviewStatus(
        UUID complaintId,
        DuplicateReviewStatus reviewStatus
    );
}