package com.civicpulse.backend.repository;

import com.civicpulse.backend.entity.ComplaintUpvote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ComplaintUpvoteRepository extends JpaRepository<ComplaintUpvote, UUID> {
    boolean existsByComplaint_IdAndCitizen_Id(UUID complaintId, UUID citizenId);
    List<ComplaintUpvote> findByComplaint_Id(UUID complaintId);
    List<ComplaintUpvote> findByCitizen_IdOrderByCreatedAtDesc(UUID citizenId);
}