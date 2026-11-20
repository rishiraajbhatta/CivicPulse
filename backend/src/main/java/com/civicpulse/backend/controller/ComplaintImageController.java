package com.civicpulse.backend.controller;

import com.civicpulse.backend.dto.ComplaintImageResponse;
import com.civicpulse.backend.entity.Citizen;
import com.civicpulse.backend.entity.ComplaintImage;
import com.civicpulse.backend.entity.Moderator;
import com.civicpulse.backend.service.AuthenticatedUserService;
import com.civicpulse.backend.service.ComplaintImageService;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
public class ComplaintImageController {

    private final ComplaintImageService complaintImageService;
    private final AuthenticatedUserService authenticatedUserService;

    public ComplaintImageController(
            ComplaintImageService complaintImageService,
            AuthenticatedUserService authenticatedUserService
    ) {
        this.complaintImageService = complaintImageService;
        this.authenticatedUserService = authenticatedUserService;
    }

    // CITIZEN IMAGE UPLOAD

    @PostMapping(
        value = "/api/complaints/{complaintId}/images",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ComplaintImageResponse> uploadCitizenImage(
            @PathVariable UUID complaintId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption
    ) {

        Citizen citizen =
            authenticatedUserService.getCurrentCitizen();

        ComplaintImage image =
            complaintImageService.uploadCitizenImage(
                complaintId,
                file,
                caption,
                citizen
            );

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(convertToResponse(image));
    }

    // MODERATOR IMAGE UPLOAD

    @PostMapping(
        value = "/api/moderators/complaints/{complaintId}/images",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ComplaintImageResponse> uploadModeratorImage(
            @PathVariable UUID complaintId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("imageType") String imageType,
            @RequestParam(value = "caption", required = false) String caption
    ) {

        Moderator moderator =
            authenticatedUserService.getCurrentModerator();

        ComplaintImage image =
            complaintImageService.uploadModeratorImage(
                complaintId,
                file,
                imageType,
                caption,
                moderator
            );

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(convertToResponse(image));
    }

    // CITIZEN RETRIEVES COMPLAINT IMAGES

    @GetMapping("/api/complaints/{complaintId}/images")
    public ResponseEntity<List<ComplaintImageResponse>> getCitizenImages(
            @PathVariable UUID complaintId
    ) {

        Citizen citizen =
            authenticatedUserService.getCurrentCitizen();

        List<ComplaintImageResponse> images =
            complaintImageService.getCitizenComplaintImages(
                complaintId,
                citizen
            );

        return ResponseEntity.ok(images);
    }

    // MODERATOR RETRIEVES COMPLAINT IMAGES

    @GetMapping("/api/moderators/complaints/{complaintId}/images")
    public ResponseEntity<List<ComplaintImageResponse>> getModeratorImages(
            @PathVariable UUID complaintId
    ) {

        authenticatedUserService.getCurrentModerator();

        List<ComplaintImageResponse> images =
            complaintImageService.getModeratorComplaintImages(
                complaintId
            );

        return ResponseEntity.ok(images);
    }

    // CONVERT ENTITY TO RESPONSE

    private ComplaintImageResponse convertToResponse(
            ComplaintImage image
    ) {

        return new ComplaintImageResponse(
            image.getId(),
            image.getImageUrl(),
            image.getImageType(),
            image.getCaption(),
            image.getUploadedAt()
        );
    }
}