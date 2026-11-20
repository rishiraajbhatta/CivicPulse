package com.civicpulse.backend.dto;

import com.civicpulse.backend.entity.ComplaintStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class ComplaintStatusUpdateRequest {

    @NotNull(message = "Complaint status is required")
    private ComplaintStatus status;

    @Size(max = 2000, message = "Remarks cannot exceed 2000 characters")
    private String remarks;

    private UUID departmentId;

    private String rejectionReason;

    public ComplaintStatusUpdateRequest() {
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public UUID getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(UUID departmentId) {
        this.departmentId = departmentId;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}