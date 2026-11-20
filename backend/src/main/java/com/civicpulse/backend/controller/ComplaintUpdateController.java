package com.civicpulse.backend.controller;

import com.civicpulse.backend.dto.ComplaintUpdateResponse;
import com.civicpulse.backend.entity.Citizen;
import com.civicpulse.backend.entity.Complaint;
import com.civicpulse.backend.repository.ComplaintRepository;
import com.civicpulse.backend.service.AuthenticatedUserService;
import com.civicpulse.backend.service.ComplaintUpdateService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintUpdateController {

    private final ComplaintUpdateService complaintUpdateService;
    private final ComplaintRepository complaintRepository;
    private final AuthenticatedUserService authenticatedUserService;

    public ComplaintUpdateController(
            ComplaintUpdateService complaintUpdateService,
            ComplaintRepository complaintRepository,
            AuthenticatedUserService authenticatedUserService
    ) {
        this.complaintUpdateService = complaintUpdateService;
        this.complaintRepository = complaintRepository;
        this.authenticatedUserService = authenticatedUserService;
    }

    @GetMapping("/{complaintId}/updates")
    public ResponseEntity<List<ComplaintUpdateResponse>> getComplaintHistory(
            @PathVariable UUID complaintId
    ) {

        Citizen citizen =
            authenticatedUserService.getCurrentCitizen();

        Complaint complaint = complaintRepository
            .findById(complaintId)
            .orElseThrow(() -> new IllegalArgumentException(
                "Complaint not found."
            ));

        if (!complaint.getCitizen().getId().equals(citizen.getId())) {
            throw new AccessDeniedException(
                "You cannot view another citizen's complaint history."
            );
        }

        List<ComplaintUpdateResponse> history =
            complaintUpdateService.getComplaintHistory(complaintId);

        return ResponseEntity.ok(history);
    }
}