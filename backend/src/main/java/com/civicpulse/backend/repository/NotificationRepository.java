package com.civicpulse.backend.repository;

import com.civicpulse.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository
        extends JpaRepository<Notification, UUID> {

    // Citizen notifications
    List<Notification> findByCitizen_IdOrderByCreatedAtDesc(
            UUID citizenId
    );

    List<Notification> findByCitizen_IdAndReadFalseOrderByCreatedAtDesc(
            UUID citizenId
    );

    long countByCitizen_IdAndReadFalse(UUID citizenId);

    // Moderator notifications
    List<Notification> findByModerator_IdOrderByCreatedAtDesc(
            UUID moderatorId
    );

    List<Notification> findByModerator_IdAndReadFalseOrderByCreatedAtDesc(
            UUID moderatorId
    );

    long countByModerator_IdAndReadFalse(UUID moderatorId);
}
