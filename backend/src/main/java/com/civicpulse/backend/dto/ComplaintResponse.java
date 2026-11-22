package com.civicpulse.backend.dto;

import com.civicpulse.backend.entity.ComplaintCategory;
import com.civicpulse.backend.entity.ComplaintStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public class ComplaintResponse {

    private UUID id;
    private String complaintCode;
    private String citizenName;
    private ComplaintCategory category;
    private String description;
    private Double latitude;
    private Double longitude;
    private String address;
    private ComplaintStatus status;
    private String departmentName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private int upvoteCount = 1;

    public ComplaintResponse() {
    }

    public ComplaintResponse(
            UUID id,
            String complaintCode,
            String citizenName,
            ComplaintCategory category,
            String description,
            Double latitude,
            Double longitude,
            String address,
            ComplaintStatus status,
            String departmentName,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            LocalDateTime resolvedAt
    ) {
        this.id = id;
        this.complaintCode = complaintCode;
        this.citizenName = citizenName;
        this.category = category;
        this.description = description;
        this.latitude = latitude;
        this.longitude = longitude;
        this.address = address;
        this.status = status;
        this.departmentName = departmentName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.resolvedAt = resolvedAt;
    }

    public ComplaintResponse(
            UUID id,
            String complaintCode,
            String citizenName,
            ComplaintCategory category,
            String description,
            Double latitude,
            Double longitude,
            String address,
            ComplaintStatus status,
            String departmentName,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            LocalDateTime resolvedAt,
            int upvoteCount
    ) {
        this(id, complaintCode, citizenName, category, description, latitude, longitude, address, status, departmentName, createdAt, updatedAt, resolvedAt);
        this.upvoteCount = Math.max(upvoteCount, 1);
    }

    public UUID getId() {
        return id;
    }

    public String getComplaintCode() {
        return complaintCode;
    }

    public String getCitizenName() {
        return citizenName;
    }

    public ComplaintCategory getCategory() {
        return category;
    }

    public String getDescription() {
        return description;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public String getAddress() {
        return address;
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public int getUpvoteCount() {
        return Math.max(upvoteCount, 1);
    }
}