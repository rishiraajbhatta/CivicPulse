package com.civicpulse.backend.dto;

import com.civicpulse.backend.entity.ComplaintStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public class ComplaintUpdateResponse {

    private UUID id;
    private ComplaintStatus status;
    private String remarks;
    private String updatedByModeratorName;
    private LocalDateTime updatedAt;

    public ComplaintUpdateResponse() {
    }

    public ComplaintUpdateResponse(
            UUID id,
            ComplaintStatus status,
            String remarks,
            String updatedByModeratorName,
            LocalDateTime updatedAt
    ) {
        this.id = id;
        this.status = status;
        this.remarks = remarks;
        this.updatedByModeratorName = updatedByModeratorName;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public String getRemarks() {
        return remarks;
    }

    public String getUpdatedByModeratorName() {
        return updatedByModeratorName;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
