package com.civicpulse.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class CitizenResponse {

    private UUID id;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private LocalDateTime createdAt;

    public CitizenResponse() {
    }

    public CitizenResponse(
            UUID id,
            String fullName,
            String email,
            String phone,
            String address,
            LocalDateTime createdAt
    ) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.createdAt = createdAt;
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

    public String getPhone() {
        return phone;
    }

    public String getAddress() {
        return address;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}