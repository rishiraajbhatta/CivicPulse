package com.civicpulse.backend.service;

import com.civicpulse.backend.dto.NotificationResponse;
import com.civicpulse.backend.entity.Citizen;
import com.civicpulse.backend.entity.Moderator;
import com.civicpulse.backend.entity.Complaint;
import com.civicpulse.backend.entity.Notification;
import com.civicpulse.backend.repository.NotificationRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(
            NotificationRepository notificationRepository
    ) {
        this.notificationRepository = notificationRepository;
    }

    // ==========================================
    // CITIZEN NOTIFICATIONS
    // ==========================================

    @Transactional
    public void createNotification(
            Citizen citizen,
            Complaint complaint,
            String title,
            String message,
            String notificationType
    ) {

        Notification notification = new Notification();

        notification.setCitizen(citizen);
        notification.setComplaint(complaint);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType(notificationType);
        notification.setRead(false);

        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getCitizenNotifications(
            UUID citizenId
    ) {

        return notificationRepository
            .findByCitizen_IdOrderByCreatedAtDesc(citizenId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadNotificationCount(UUID citizenId) {

        return notificationRepository.countByCitizen_IdAndReadFalse(
            citizenId
        );
    }

    @Transactional
    public void markAsRead(UUID notificationId, UUID citizenId) {

        Notification notification = notificationRepository
            .findById(notificationId)
            .orElseThrow(() -> new IllegalArgumentException(
                "Notification not found."
            ));

        if (notification.getCitizen() == null ||
                !notification.getCitizen().getId().equals(citizenId)) {

            throw new IllegalArgumentException(
                "You cannot access this notification."
            );
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    // ==========================================
    // MODERATOR NOTIFICATIONS
    // ==========================================

    @Transactional
    public void createModeratorNotification(
            Moderator moderator,
            Complaint complaint,
            String title,
            String message,
            String notificationType
    ) {

        Notification notification = new Notification();

        notification.setModerator(moderator);
        notification.setComplaint(complaint);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setNotificationType(notificationType);
        notification.setRead(false);

        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getModeratorNotifications(
            UUID moderatorId
    ) {

        return notificationRepository
            .findByModerator_IdOrderByCreatedAtDesc(moderatorId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadModeratorNotificationCount(
            UUID moderatorId
    ) {

        return notificationRepository
            .countByModerator_IdAndReadFalse(moderatorId);
    }

    @Transactional
    public void markModeratorNotificationAsRead(
            UUID notificationId,
            UUID moderatorId
    ) {

        Notification notification = notificationRepository
            .findById(notificationId)
            .orElseThrow(() -> new IllegalArgumentException(
                "Notification not found."
            ));

        if (notification.getModerator() == null ||
                !notification.getModerator().getId().equals(moderatorId)) {

            throw new IllegalArgumentException(
                "You cannot access this notification."
            );
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    // ==========================================
    // SHARED RESPONSE MAPPER
    // ==========================================

    private NotificationResponse toResponse(
            Notification notification
    ) {

        return new NotificationResponse(
            notification.getId(),
            notification.getTitle(),
            notification.getMessage(),
            notification.getNotificationType(),
            notification.isRead(),
            notification.getComplaint() != null
                ? notification.getComplaint().getId()
                : null,
            notification.getCreatedAt()
        );
    }
}
