package com.civicpulse.backend.repository;

import com.civicpulse.backend.entity.ComplaintUpdate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ComplaintUpdateRepository
        extends JpaRepository<ComplaintUpdate, UUID> {

    List<ComplaintUpdate> findByComplaint_IdOrderByUpdatedAtAsc(
            UUID complaintId
    );

    List<ComplaintUpdate> findByUpdatedByModerator_Id(UUID moderatorId);
}