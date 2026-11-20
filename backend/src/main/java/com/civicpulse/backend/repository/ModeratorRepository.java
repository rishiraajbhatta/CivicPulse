package com.civicpulse.backend.repository;

import com.civicpulse.backend.entity.Moderator;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ModeratorRepository extends JpaRepository<Moderator, UUID> {

    Optional<Moderator> findByEmail(String email);

    Optional<Moderator> findByEmployeeId(String employeeId);

    boolean existsByEmail(String email);

    boolean existsByEmployeeId(String employeeId);

    // Retrieve all active moderators.
    List<Moderator> findByActiveTrue();
}
