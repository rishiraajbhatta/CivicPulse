package com.civicpulse.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "complaint_images")
public class ComplaintImage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Column(nullable = false, length = 1000)
    private String imageUrl;

    @Column(length = 50)
    private String imageType;

    @Column(length = 255)
    private String caption;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_citizen_id")
    private Citizen uploadedByCitizen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_moderator_id")
    private Moderator uploadedByModerator;

    @Column(nullable = false)
    private LocalDateTime uploadedAt;

    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }

    public ComplaintImage() {
    }

    public UUID getId() {
        return id;
    }

    public Complaint getComplaint() {
        return complaint;
    }

    public void setComplaint(Complaint complaint) {
        this.complaint = complaint;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getImageType() {
        return imageType;
    }

    public void setImageType(String imageType) {
        this.imageType = imageType;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    public Citizen getUploadedByCitizen() {
        return uploadedByCitizen;
    }

    public void setUploadedByCitizen(Citizen uploadedByCitizen) {
        this.uploadedByCitizen = uploadedByCitizen;
    }

    public Moderator getUploadedByModerator() {
        return uploadedByModerator;
    }

    public void setUploadedByModerator(Moderator uploadedByModerator) {
        this.uploadedByModerator = uploadedByModerator;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }
}