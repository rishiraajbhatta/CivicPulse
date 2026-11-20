package com.civicpulse.backend.repository;

import com.civicpulse.backend.entity.Complaint;
import com.civicpulse.backend.entity.ComplaintCategory;
import com.civicpulse.backend.entity.ComplaintStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {

    Optional<Complaint> findByComplaintCode(String complaintCode);

    boolean existsByComplaintCode(String complaintCode);

    List<Complaint> findByCitizen_IdOrderByCreatedAtDesc(UUID citizenId);

    List<Complaint> findByStatusOrderByCreatedAtDesc(ComplaintStatus status);

    List<Complaint> findByDepartment_Id(UUID departmentId);

    List<Complaint> findByAssignedModerator_Id(UUID moderatorId);

    // FIND POTENTIAL DUPLICATE COMPLAINTS
    @Query("""
        SELECT c FROM Complaint c
        WHERE c.id <> :excludedComplaintId
        AND c.category = :category
        AND c.latitude BETWEEN :minLatitude AND :maxLatitude
        AND c.longitude BETWEEN :minLongitude AND :maxLongitude
        AND c.status IN :activeStatuses
        AND c.primaryComplaint IS NULL
        ORDER BY c.createdAt DESC
        """)
    List<Complaint> findPotentialDuplicates(
        @Param("excludedComplaintId") UUID excludedComplaintId,
        @Param("category") ComplaintCategory category,
        @Param("minLatitude") Double minLatitude,
        @Param("maxLatitude") Double maxLatitude,
        @Param("minLongitude") Double minLongitude,
        @Param("maxLongitude") Double maxLongitude,
        @Param("activeStatuses") List<ComplaintStatus> activeStatuses
    );
}
