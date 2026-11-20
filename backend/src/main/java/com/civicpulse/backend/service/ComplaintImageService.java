package com.civicpulse.backend.service;

import com.cloudinary.Cloudinary;

import com.civicpulse.backend.dto.ComplaintImageResponse;
import com.civicpulse.backend.entity.Citizen;
import com.civicpulse.backend.entity.Complaint;
import com.civicpulse.backend.entity.ComplaintImage;
import com.civicpulse.backend.entity.ComplaintStatus;
import com.civicpulse.backend.entity.Moderator;

import com.civicpulse.backend.repository.ComplaintImageRepository;
import com.civicpulse.backend.repository.ComplaintRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ComplaintImageService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private static final List<String> ALLOWED_CONTENT_TYPES =
        List.of(
            "image/jpeg",
            "image/png",
            "image/webp"
        );

    private final Cloudinary cloudinary;
    private final ComplaintRepository complaintRepository;
    private final ComplaintImageRepository complaintImageRepository;

    public ComplaintImageService(
            Cloudinary cloudinary,
            ComplaintRepository complaintRepository,
            ComplaintImageRepository complaintImageRepository
    ) {
        this.cloudinary = cloudinary;
        this.complaintRepository = complaintRepository;
        this.complaintImageRepository = complaintImageRepository;
    }

    // CITIZEN IMAGE UPLOAD

    @Transactional
    public ComplaintImage uploadCitizenImage(
            UUID complaintId,
            MultipartFile file,
            String caption,
            Citizen citizen
    ) {

        Complaint complaint = getComplaint(complaintId);

        if (!complaint.getCitizen().getId().equals(citizen.getId())) {
            throw new IllegalArgumentException(
                "You can only upload images to your own complaints."
            );
        }

        if (complaint.getStatus() != ComplaintStatus.SUBMITTED) {
            throw new IllegalArgumentException(
                "Complaint images can only be uploaded before moderator review."
            );
        }

        return uploadAndSave(
            complaint,
            file,
            "COMPLAINT",
            caption,
            citizen,
            null
        );
    }

    // MODERATOR IMAGE UPLOAD

    @Transactional
    public ComplaintImage uploadModeratorImage(
            UUID complaintId,
            MultipartFile file,
            String imageType,
            String caption,
            Moderator moderator
    ) {

        Complaint complaint = getComplaint(complaintId);

        if (complaint.getStatus() == ComplaintStatus.RESOLVED ||
                complaint.getStatus() == ComplaintStatus.REJECTED) {
            throw new IllegalArgumentException(
                "Images cannot be uploaded to resolved or rejected complaints."
            );
        }

        if (!"PROGRESS".equals(imageType) &&
                !"FINAL_PROOF".equals(imageType)) {
            throw new IllegalArgumentException(
                "Moderators can upload only PROGRESS or FINAL_PROOF images."
            );
        }

        return uploadAndSave(
            complaint,
            file,
            imageType,
            caption,
            null,
            moderator
        );
    }

    // RETRIEVE IMAGES FOR CITIZEN

    @Transactional(readOnly = true)
    public List<ComplaintImageResponse> getCitizenComplaintImages(
            UUID complaintId,
            Citizen citizen
    ) {

        Complaint complaint = getComplaint(complaintId);

        if (!complaint.getCitizen().getId().equals(citizen.getId())) {
            throw new IllegalArgumentException(
                "You cannot view images belonging to another citizen."
            );
        }

        return getComplaintImages(complaintId);
    }

    // RETRIEVE IMAGES FOR MODERATOR

    @Transactional(readOnly = true)
    public List<ComplaintImageResponse> getModeratorComplaintImages(
            UUID complaintId
    ) {

        getComplaint(complaintId);

        return getComplaintImages(complaintId);
    }

    // COMMON IMAGE RETRIEVAL

    private List<ComplaintImageResponse> getComplaintImages(
            UUID complaintId
    ) {

        return complaintImageRepository
            .findByComplaint_Id(complaintId)
            .stream()
            .map(this::convertToResponse)
            .toList();
    }

    // UPLOAD TO CLOUDINARY AND SAVE IN DATABASE

    private ComplaintImage uploadAndSave(
            Complaint complaint,
            MultipartFile file,
            String imageType,
            String caption,
            Citizen citizen,
            Moderator moderator
    ) {

        validateImage(file);

        try {

            Map<String, Object> uploadOptions = Map.of(
                "folder", "civicpulse/complaints/" +
                    complaint.getComplaintCode(),
                "resource_type", "image"
            );

            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                uploadOptions
            );

            String imageUrl = (String) uploadResult.get("secure_url");

            if (imageUrl == null || imageUrl.isBlank()) {
                throw new IllegalStateException(
                    "Cloudinary did not return an image URL."
                );
            }

            ComplaintImage image = new ComplaintImage();

            image.setComplaint(complaint);
            image.setImageUrl(imageUrl);
            image.setImageType(imageType);
            image.setCaption(caption);
            image.setUploadedByCitizen(citizen);
            image.setUploadedByModerator(moderator);

            return complaintImageRepository.save(image);

        } catch (IOException exception) {

            throw new IllegalStateException(
                "Image upload failed. Please try again.",
                exception
            );
        }
    }

    // FIND COMPLAINT

    private Complaint getComplaint(UUID complaintId) {

        return complaintRepository.findById(complaintId)
            .orElseThrow(() -> new IllegalArgumentException(
                "Complaint not found."
            ));
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

    // IMAGE VALIDATION

    private void validateImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                "Please select an image to upload."
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                "Image size cannot exceed 5 MB."
            );
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                "Only JPG, PNG and WEBP images are allowed."
            );
        }
    }
}