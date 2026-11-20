package com.civicpulse.backend.controller;

import com.civicpulse.backend.dto.ComplaintUpdateResponse;
import com.civicpulse.backend.service.AuthenticatedUserService;
import com.civicpulse.backend.service.ComplaintUpdateService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/moderators/complaints")
public class ModeratorComplaintUpdateController {

    private final ComplaintUpdateService complaintUpdateService;
    private final AuthenticatedUserService authenticatedUserService;

    public ModeratorComplaintUpdateController(
            ComplaintUpdateService complaintUpdateService,
            AuthenticatedUserService authenticatedUserService
    ) {
        this.complaintUpdateService = complaintUpdateService;
        this.authenticatedUserService = authenticatedUserService;
    }

    // GET COMPLAINT HISTORY FOR MODERATORS
    @GetMapping("/{complaintId}/updates")
    public ResponseEntity<List<ComplaintUpdateResponse>> getComplaintHistory(
            @PathVariable UUID complaintId
    ) {

        // Ensure the requester is an authenticated moderator.
        authenticatedUserService.getCurrentModerator();

        List<ComplaintUpdateResponse> history =
            complaintUpdateService.getComplaintHistory(complaintId);

        return ResponseEntity.ok(history);
    }
}
