package com.civicpulse.backend.repository;

import com.civicpulse.backend.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {

    Optional<Feedback> findByComplaint_Id(UUID complaintId);

    boolean existsByComplaint_Id(UUID complaintId);

    List<Feedback> findByCitizen_IdOrderBySubmittedAtDesc(UUID citizenId);

}