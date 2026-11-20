package com.civicpulse.backend.repository;

import com.civicpulse.backend.entity.ComplaintImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ComplaintImageRepository
        extends JpaRepository<ComplaintImage, UUID> {

    List<ComplaintImage> findByComplaint_Id(UUID complaintId);

    List<ComplaintImage> findByImageType(String imageType);

    List<ComplaintImage> findByComplaint_IdAndImageType(
            UUID complaintId,
            String imageType
    );
}