package com.civicpulse.backend.controller;

import com.civicpulse.backend.dto.ComplaintCreateRequest;
import com.civicpulse.backend.dto.DuplicateMatchPreview;
import com.civicpulse.backend.dto.UpvoteResponse;
import com.civicpulse.backend.dto.ComplaintResponse;

import com.civicpulse.backend.entity.Citizen;
import com.civicpulse.backend.entity.ComplaintCategory;

import com.civicpulse.backend.service.AuthenticatedUserService;
import com.civicpulse.backend.service.ComplaintService;
import com.civicpulse.backend.service.DuplicateDetectionService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final AuthenticatedUserService authenticatedUserService;
    private final DuplicateDetectionService duplicateDetectionService;

    public ComplaintController(
            ComplaintService complaintService,
            AuthenticatedUserService authenticatedUserService,
            DuplicateDetectionService duplicateDetectionService
    ) {
        this.complaintService = complaintService;
        this.authenticatedUserService = authenticatedUserService;
        this.duplicateDetectionService = duplicateDetectionService;
    }

    @PostMapping
    public ResponseEntity<ComplaintResponse> createComplaint(
            @Valid @RequestBody ComplaintCreateRequest request
    ) {

        Citizen citizen = authenticatedUserService.getCurrentCitizen();

        ComplaintResponse response =
            complaintService.createComplaint(request, citizen);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints() {

        Citizen citizen = authenticatedUserService.getCurrentCitizen();

        List<ComplaintResponse> complaints =
            complaintService.getCitizenComplaints(citizen);

        return ResponseEntity.ok(complaints);
    }

    @GetMapping("/check-duplicate")
    public ResponseEntity<List<DuplicateMatchPreview>> checkDuplicate(
            @RequestParam ComplaintCategory category,
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(required = false) String description
    ) {
        authenticatedUserService.getCurrentCitizen();

        List<DuplicateMatchPreview> matches =
            duplicateDetectionService.findNearbyMatches(
                category,
                latitude,
                longitude,
                description
            );

        return ResponseEntity.ok(matches);
    }

    @PostMapping("/{complaintId}/upvote")
    public ResponseEntity<UpvoteResponse> upvoteComplaint(
            @PathVariable UUID complaintId
    ) {
        Citizen citizen = authenticatedUserService.getCurrentCitizen();
        UpvoteResponse response = complaintService.upvoteComplaint(complaintId, citizen);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/upvoted")
    public ResponseEntity<List<ComplaintResponse>> getUpvotedComplaints() {
        Citizen citizen = authenticatedUserService.getCurrentCitizen();
        List<ComplaintResponse> complaints = complaintService.getUpvotedComplaints(citizen);
        return ResponseEntity.ok(complaints);
    }
}