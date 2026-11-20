package com.civicpulse.backend.service;

import com.civicpulse.backend.dto.ComplaintUpdateResponse;
import com.civicpulse.backend.entity.Complaint;
import com.civicpulse.backend.entity.ComplaintStatus;
import com.civicpulse.backend.entity.ComplaintUpdate;
import com.civicpulse.backend.entity.Moderator;
import com.civicpulse.backend.repository.ComplaintUpdateRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ComplaintUpdateService {

    private final ComplaintUpdateRepository complaintUpdateRepository;

    public ComplaintUpdateService(
            ComplaintUpdateRepository complaintUpdateRepository
    ) {
        this.complaintUpdateRepository = complaintUpdateRepository;
    }

    @Transactional
    public void recordUpdate(
            Complaint complaint,
            ComplaintStatus status,
            String remarks,
            Moderator moderator
    ) {

        ComplaintUpdate update = new ComplaintUpdate();

        update.setComplaint(complaint);
        update.setStatus(status);
        update.setRemarks(remarks);
        update.setUpdatedByModerator(moderator);

        complaintUpdateRepository.save(update);
    }

    @Transactional(readOnly = true)
    public List<ComplaintUpdateResponse> getComplaintHistory(
            java.util.UUID complaintId
    ) {

        return complaintUpdateRepository
            .findByComplaint_IdOrderByUpdatedAtAsc(complaintId)
            .stream()
            .map(update -> new ComplaintUpdateResponse(
                update.getId(),
                update.getStatus(),
                update.getRemarks(),
                update.getUpdatedByModerator() != null
                    ? update.getUpdatedByModerator().getFullName()
                    : null,
                update.getUpdatedAt()
            ))
            .toList();
    }
}