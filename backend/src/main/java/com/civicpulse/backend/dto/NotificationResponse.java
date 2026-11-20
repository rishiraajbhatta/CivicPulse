package com.civicpulse.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class NotificationResponse {

    private UUID id;
    private String title;
    private String message;
    private String notificationType;
    private boolean read;
    private UUID complaintId;
    private LocalDateTime createdAt;

    public NotificationResponse() {
    }

    public NotificationResponse(
            UUID id,
            String title,
            String message,
            String notificationType,
            boolean read,
            UUID complaintId,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.notificationType = notificationType;
        this.read = read;
        this.complaintId = complaintId;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public String getNotificationType() {
        return notificationType;
    }

    public boolean isRead() {
        return read;
    }

    public UUID getComplaintId() {
        return complaintId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}