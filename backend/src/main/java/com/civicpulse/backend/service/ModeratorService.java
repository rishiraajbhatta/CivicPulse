package com.civicpulse.backend.service;

import com.civicpulse.backend.dto.ModeratorLoginRequest;
import com.civicpulse.backend.dto.ModeratorResponse;
import com.civicpulse.backend.dto.AuthResponse;

import com.civicpulse.backend.entity.Moderator;
import com.civicpulse.backend.repository.ModeratorRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ModeratorService {

    private final ModeratorRepository moderatorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public ModeratorService(
            ModeratorRepository moderatorRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.moderatorRepository = moderatorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public AuthResponse loginModerator(ModeratorLoginRequest request) {

        String employeeId = request.getEmployeeId().trim();

        Moderator moderator = moderatorRepository
            .findByEmployeeId(employeeId)
            .orElseThrow(() -> new IllegalArgumentException(
                "Invalid employee ID or password."
            ));

        if (!moderator.isActive()) {
            throw new IllegalArgumentException(
                "This moderator account is inactive."
            );
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                moderator.getPassword()
        )) {
            throw new IllegalArgumentException(
                "Invalid employee ID or password."
            );
        }

        String token = jwtService.generateToken(
            moderator.getId(),
            moderator.getEmail(),
            "MODERATOR"
        );

        return new AuthResponse(
            token,
            moderator.getId(),
            moderator.getFullName(),
            moderator.getEmail(),
            "MODERATOR"
        );
    }
}