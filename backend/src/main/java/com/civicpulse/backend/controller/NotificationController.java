    package com.civicpulse.backend.controller;

    import com.civicpulse.backend.dto.NotificationResponse;
    import com.civicpulse.backend.entity.Citizen;

    import com.civicpulse.backend.service.AuthenticatedUserService;
    import com.civicpulse.backend.service.NotificationService;

    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;
    import java.util.UUID;

    @RestController
    @RequestMapping("/api/notifications")
    public class NotificationController {

        private final NotificationService notificationService;
        private final AuthenticatedUserService authenticatedUserService;

        public NotificationController(
                NotificationService notificationService,
                AuthenticatedUserService authenticatedUserService
        ) {
            this.notificationService = notificationService;
            this.authenticatedUserService = authenticatedUserService;
        }

        @GetMapping
        public ResponseEntity<List<NotificationResponse>> getMyNotifications() {

            Citizen citizen =
                authenticatedUserService.getCurrentCitizen();

            List<NotificationResponse> notifications =
                notificationService.getCitizenNotifications(citizen.getId());

            return ResponseEntity.ok(notifications);
        }

        @GetMapping("/unread-count")
        public ResponseEntity<Long> getUnreadNotificationCount() {

            Citizen citizen =
                authenticatedUserService.getCurrentCitizen();

            long count =
                notificationService.getUnreadNotificationCount(citizen.getId());

            return ResponseEntity.ok(count);
        }

        @PatchMapping("/{notificationId}/read")
        public ResponseEntity<Void> markNotificationAsRead(
                @PathVariable UUID notificationId
        ) {

            Citizen citizen =
                authenticatedUserService.getCurrentCitizen();

            notificationService.markAsRead(
                notificationId,
                citizen.getId()
            );

            return ResponseEntity.noContent().build();
        }
    }