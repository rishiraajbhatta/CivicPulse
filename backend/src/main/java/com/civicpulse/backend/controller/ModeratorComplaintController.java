package com.civicpulse.backend.controller;

import com.civicpulse.backend.dto.ComplaintResponse;
import com.civicpulse.backend.dto.ComplaintStatusUpdateRequest;

import com.civicpulse.backend.entity.Moderator;

import com.civicpulse.backend.service.AuthenticatedUserService;
import com.civicpulse.backend.service.ModeratorComplaintService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/moderators/complaints")
public class ModeratorComplaintController {

    private final ModeratorComplaintService moderatorComplaintService;
    private final AuthenticatedUserService authenticatedUserService;

    public ModeratorComplaintController(
            ModeratorComplaintService moderatorComplaintService,
            AuthenticatedUserService authenticatedUserService
    ) {
        this.moderatorComplaintService = moderatorComplaintService;
        this.authenticatedUserService = authenticatedUserService;
    }

    @GetMapping
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints() {

        authenticatedUserService.getCurrentModerator();

        List<ComplaintResponse> complaints =
            moderatorComplaintService.getAllComplaints();

        return ResponseEntity.ok(complaints);
    }

    @PatchMapping("/{complaintId}/status")
    public ResponseEntity<ComplaintResponse> updateComplaintStatus(
            @PathVariable UUID complaintId,
            @Valid @RequestBody ComplaintStatusUpdateRequest request
    ) {

        Moderator moderator =
            authenticatedUserService.getCurrentModerator();

        ComplaintResponse response =
            moderatorComplaintService.updateComplaint(
                complaintId,
                request,
                moderator
            );

        return ResponseEntity.ok(response);
    }
}