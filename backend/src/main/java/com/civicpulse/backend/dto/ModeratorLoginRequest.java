package com.civicpulse.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ModeratorLoginRequest {

    @NotBlank(message = "Employee ID is required")
    @Size(max = 50)
    private String employeeId;

    @NotBlank(message = "Password is required")
    private String password;

    public ModeratorLoginRequest() {
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}