package com.civicpulse.backend.controller;

import com.civicpulse.backend.dto.CitizenRegisterRequest;
import com.civicpulse.backend.dto.CitizenLoginRequest;
import com.civicpulse.backend.dto.CitizenResponse;
import com.civicpulse.backend.dto.AuthResponse;

import com.civicpulse.backend.service.CitizenService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/citizens")
public class CitizenController {

    private final CitizenService citizenService;

    public CitizenController(CitizenService citizenService) {
        this.citizenService = citizenService;
    }

    @PostMapping("/register")
    public ResponseEntity<CitizenResponse> registerCitizen(
            @Valid @RequestBody CitizenRegisterRequest request
    ) {

        CitizenResponse response =
            citizenService.registerCitizen(request);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginCitizen(
            @Valid @RequestBody CitizenLoginRequest request
    ) {

        AuthResponse response =
            citizenService.loginCitizen(request);

        return ResponseEntity.ok(response);
    }
}