package com.civicpulse.backend.dto;

import java.util.UUID;

public class ModeratorResponse {

    private UUID id;
    private String fullName;
    private String email;
    private String employeeId;
    private boolean active;

    public ModeratorResponse() {
    }

    public ModeratorResponse(
            UUID id,
            String fullName,
            String email,
            String employeeId,
            boolean active
    ) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.employeeId = employeeId;
        this.active = active;
    }

    public UUID getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public boolean isActive() {
        return active;
    }
}