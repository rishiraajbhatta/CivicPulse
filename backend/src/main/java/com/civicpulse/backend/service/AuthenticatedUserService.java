package com.civicpulse.backend.service;

import com.civicpulse.backend.entity.Citizen;
import com.civicpulse.backend.entity.Moderator;

import com.civicpulse.backend.repository.CitizenRepository;
import com.civicpulse.backend.repository.ModeratorRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthenticatedUserService {

    private final CitizenRepository citizenRepository;
    private final ModeratorRepository moderatorRepository;

    public AuthenticatedUserService(
            CitizenRepository citizenRepository,
            ModeratorRepository moderatorRepository
    ) {
        this.citizenRepository = citizenRepository;
        this.moderatorRepository = moderatorRepository;
    }

    public UUID getCurrentUserId() {

        Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                !authentication.isAuthenticated() ||
                authentication.getPrincipal() == null) {

            throw new AccessDeniedException(
                "You must be logged in to perform this action."
            );
        }

        try {
            return UUID.fromString(
                authentication.getPrincipal().toString()
            );

        } catch (IllegalArgumentException exception) {

            throw new AccessDeniedException(
                "Invalid authenticated user."
            );
        }
    }

    public Citizen getCurrentCitizen() {

        Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                authentication.getAuthorities().stream()
                    .noneMatch(authority ->
                        authority.getAuthority().equals("ROLE_CITIZEN")
                    )) {

            throw new AccessDeniedException(
                "Only citizens can perform this action."
            );
        }

        UUID citizenId = getCurrentUserId();

        return citizenRepository.findById(citizenId)
            .orElseThrow(() -> new AccessDeniedException(
                "Citizen account not found."
            ));
    }

    public Moderator getCurrentModerator() {

        Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null ||
                authentication.getAuthorities().stream()
                    .noneMatch(authority ->
                        authority.getAuthority().equals("ROLE_MODERATOR")
                    )) {

            throw new AccessDeniedException(
                "Only moderators can perform this action."
            );
        }

        UUID moderatorId = getCurrentUserId();

        return moderatorRepository.findById(moderatorId)
            .orElseThrow(() -> new AccessDeniedException(
                "Moderator account not found."
            ));
    }
}