package com.civicpulse.backend.controller;

import com.civicpulse.backend.dto.NotificationResponse;
import com.civicpulse.backend.entity.Moderator;
import com.civicpulse.backend.service.AuthenticatedUserService;
import com.civicpulse.backend.service.NotificationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/moderators/notifications")
public class ModeratorNotificationController {

    private final NotificationService notificationService;
    private final AuthenticatedUserService authenticatedUserService;

    public ModeratorNotificationController(
            NotificationService notificationService,
            AuthenticatedUserService authenticatedUserService
    ) {
        this.notificationService = notificationService;
        this.authenticatedUserService = authenticatedUserService;
    }

    // Get all notifications for the logged-in moderator.
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications() {

        Moderator moderator =
            authenticatedUserService.getCurrentModerator();

        List<NotificationResponse> notifications =
            notificationService.getModeratorNotifications(
                moderator.getId()
            );

        return ResponseEntity.ok(notifications);
    }

    // Get unread notification count.
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadNotificationCount() {

        Moderator moderator =
            authenticatedUserService.getCurrentModerator();

        long count =
            notificationService.getUnreadModeratorNotificationCount(
                moderator.getId()
            );

        return ResponseEntity.ok(count);
    }

    // Mark a moderator notification as read.
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markNotificationAsRead(
            @PathVariable UUID notificationId
    ) {

        Moderator moderator =
            authenticatedUserService.getCurrentModerator();

        notificationService.markModeratorNotificationAsRead(
            notificationId,
            moderator.getId()
        );

        return ResponseEntity.noContent().build();
    }
}
