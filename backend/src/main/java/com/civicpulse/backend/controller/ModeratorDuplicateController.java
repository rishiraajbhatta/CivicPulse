package com.civicpulse.backend.controller;

import com.civicpulse.backend.dto.ComplaintDuplicateResponse;
import com.civicpulse.backend.dto.DuplicateReviewRequest;
import com.civicpulse.backend.entity.Moderator;
import com.civicpulse.backend.service.AuthenticatedUserService;
import com.civicpulse.backend.service.DuplicateReviewService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/moderators/duplicates")
public class ModeratorDuplicateController {

    private final DuplicateReviewService duplicateReviewService;
    private final AuthenticatedUserService authenticatedUserService;

    public ModeratorDuplicateController(
            DuplicateReviewService duplicateReviewService,
            AuthenticatedUserService authenticatedUserService
    ) {
        this.duplicateReviewService = duplicateReviewService;
        this.authenticatedUserService = authenticatedUserService;
    }

    // GET ALL PENDING DUPLICATE REPORTS
    @GetMapping
    public ResponseEntity<List<ComplaintDuplicateResponse>> getPendingDuplicates() {

        authenticatedUserService.getCurrentModerator();

        List<ComplaintDuplicateResponse> duplicates =
            duplicateReviewService.getPendingDuplicates();

        return ResponseEntity.ok(duplicates);
    }

    // REVIEW A POTENTIAL DUPLICATE
    @PatchMapping("/{duplicateId}/review")
    public ResponseEntity<Void> reviewDuplicate(
            @PathVariable UUID duplicateId,
            @Valid @RequestBody DuplicateReviewRequest request
    ) {

        Moderator moderator =
            authenticatedUserService.getCurrentModerator();

        duplicateReviewService.reviewDuplicate(
            duplicateId,
            request,
            moderator
        );

        return ResponseEntity.noContent().build();
    }
}
