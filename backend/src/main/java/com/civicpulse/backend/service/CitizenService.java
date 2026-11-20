package com.civicpulse.backend.service;

import com.civicpulse.backend.dto.CitizenRegisterRequest;
import com.civicpulse.backend.dto.CitizenLoginRequest;
import com.civicpulse.backend.dto.CitizenResponse;
import com.civicpulse.backend.dto.AuthResponse;

import com.civicpulse.backend.entity.Citizen;
import com.civicpulse.backend.repository.CitizenRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CitizenService {

    private final CitizenRepository citizenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public CitizenService(
            CitizenRepository citizenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.citizenRepository = citizenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public CitizenResponse registerCitizen(CitizenRegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        if (citizenRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                "An account with this email already exists."
            );
        }

        Citizen citizen = new Citizen();

        citizen.setFullName(request.getFullName().trim());
        citizen.setEmail(email);

        citizen.setPassword(
            passwordEncoder.encode(request.getPassword())
        );

        citizen.setPhone(request.getPhone());
        citizen.setAddress(request.getAddress());

        Citizen savedCitizen = citizenRepository.save(citizen);

        return convertToResponse(savedCitizen);
    }

    @Transactional(readOnly = true)
    public AuthResponse loginCitizen(CitizenLoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        Citizen citizen = citizenRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException(
                "Invalid email or password."
            ));

        if (!passwordEncoder.matches(
                request.getPassword(),
                citizen.getPassword()
        )) {
            throw new IllegalArgumentException(
                "Invalid email or password."
            );
        }

        String token = jwtService.generateToken(
            citizen.getId(),
            citizen.getEmail(),
            "CITIZEN"
        );

        return new AuthResponse(
            token,
            citizen.getId(),
            citizen.getFullName(),
            citizen.getEmail(),
            "CITIZEN"
        );
    }

    private CitizenResponse convertToResponse(Citizen citizen) {

        return new CitizenResponse(
            citizen.getId(),
            citizen.getFullName(),
            citizen.getEmail(),
            citizen.getPhone(),
            citizen.getAddress(),
            citizen.getCreatedAt()
        );
    }
}