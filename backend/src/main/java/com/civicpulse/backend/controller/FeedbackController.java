package com.civicpulse.backend.controller;

import com.civicpulse.backend.dto.FeedbackRequest;
import com.civicpulse.backend.entity.Citizen;
import com.civicpulse.backend.service.AuthenticatedUserService;
import com.civicpulse.backend.service.FeedbackService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final AuthenticatedUserService authenticatedUserService;

    public FeedbackController(
            FeedbackService feedbackService,
            AuthenticatedUserService authenticatedUserService
    ) {
        this.feedbackService = feedbackService;
        this.authenticatedUserService = authenticatedUserService;
    }

    @PostMapping
    public ResponseEntity<String> submitFeedback(
            @Valid @RequestBody FeedbackRequest request
    ) {

        Citizen citizen =
            authenticatedUserService.getCurrentCitizen();

        feedbackService.submitFeedback(request, citizen);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body("Feedback submitted successfully!");
    }

    @GetMapping("/{complaintId}/exists")
    public ResponseEntity<Map<String, Boolean>> hasSubmittedFeedback(
            @PathVariable UUID complaintId
    ) {

        Citizen citizen =
            authenticatedUserService.getCurrentCitizen();

        boolean submitted =
            feedbackService.hasSubmittedFeedback(complaintId, citizen);

        return ResponseEntity.ok(
            Map.of("submitted", submitted)
        );
    }
}
