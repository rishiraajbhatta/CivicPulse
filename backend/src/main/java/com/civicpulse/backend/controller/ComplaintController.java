package com.civicpulse.backend.controller;

import com.civicpulse.backend.dto.ComplaintCreateRequest;
import com.civicpulse.backend.dto.ComplaintResponse;

import com.civicpulse.backend.entity.Citizen;

import com.civicpulse.backend.service.AuthenticatedUserService;
import com.civicpulse.backend.service.ComplaintService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final AuthenticatedUserService authenticatedUserService;

    public ComplaintController(
            ComplaintService complaintService,
            AuthenticatedUserService authenticatedUserService
    ) {
        this.complaintService = complaintService;
        this.authenticatedUserService = authenticatedUserService;
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
}