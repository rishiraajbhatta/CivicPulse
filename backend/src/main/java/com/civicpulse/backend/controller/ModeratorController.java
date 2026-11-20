package com.civicpulse.backend.controller;

import com.civicpulse.backend.dto.ModeratorLoginRequest;
import com.civicpulse.backend.dto.AuthResponse;
import com.civicpulse.backend.service.ModeratorService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/moderators")
public class ModeratorController {

    private final ModeratorService moderatorService;

    public ModeratorController(ModeratorService moderatorService) {
        this.moderatorService = moderatorService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginModerator(
            @Valid @RequestBody ModeratorLoginRequest request
    ) {

        AuthResponse response =
            moderatorService.loginModerator(request);

        return ResponseEntity.ok(response);
    }
}