package com.civicpulse.backend.service;

import com.civicpulse.backend.dto.ComplaintDuplicateResponse;
import com.civicpulse.backend.dto.ComplaintResponse;
import com.civicpulse.backend.dto.DuplicateReviewRequest;

import com.civicpulse.backend.entity.Complaint;
import com.civicpulse.backend.entity.ComplaintDuplicate;
import com.civicpulse.backend.entity.ComplaintStatus;
import com.civicpulse.backend.entity.DuplicateReviewStatus;
import com.civicpulse.backend.entity.Moderator;

import com.civicpulse.backend.repository.ComplaintDuplicateRepository;
import com.civicpulse.backend.repository.ComplaintRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class DuplicateReviewService {

    private final ComplaintDuplicateRepository duplicateRepository;
    private final ComplaintRepository complaintRepository;
    private final ComplaintUpdateService complaintUpdateService;
    private final NotificationService notificationService;

    public DuplicateReviewService(
            ComplaintDuplicateRepository duplicateRepository,
            ComplaintRepository complaintRepository,
            ComplaintUpdateService complaintUpdateService,
            NotificationService notificationService
    ) {
        this.duplicateRepository = duplicateRepository;
        this.complaintRepository = complaintRepository;
        this.complaintUpdateService = complaintUpdateService;
        this.notificationService = notificationService;
    }

    // GET ACTIONABLE PENDING DUPLICATE REPORTS

    @Transactional(readOnly = true)
    public List<ComplaintDuplicateResponse> getPendingDuplicates() {

        return duplicateRepository
            .findByReviewStatusOrderByCreatedAtDesc(
                DuplicateReviewStatus.PENDING
            )
            .stream()

            // Hide records where either complaint has already
            // been confirmed as a duplicate.
            .filter(duplicate ->
                isStillReviewable(
                    duplicate.getComplaint(),
                    duplicate.getPossibleDuplicate()
                )
            )

            .map(this::convertToResponse)
            .toList();
    }

    // REVIEW A POTENTIAL DUPLICATE

    @Transactional
    public void reviewDuplicate(
            UUID duplicateId,
            DuplicateReviewRequest request,
            Moderator moderator
    ) {

        if (request == null || request.getReviewStatus() == null ||
                request.getReviewStatus() == DuplicateReviewStatus.PENDING) {

            throw new IllegalArgumentException(
                "Select a valid duplicate review decision."
            );
        }

        ComplaintDuplicate duplicate = duplicateRepository
            .findById(duplicateId)
            .orElseThrow(() -> new IllegalArgumentException(
                "Duplicate report not found."
            ));

        if (duplicate.getReviewStatus() != DuplicateReviewStatus.PENDING) {
            throw new IllegalArgumentException(
                "This duplicate report has already been reviewed."
            );
        }

        DuplicateReviewStatus decision = request.getReviewStatus();

        Complaint complaint = duplicate.getComplaint();

        Complaint possibleDuplicate = duplicate.getPossibleDuplicate();

        if (complaint.getId().equals(possibleDuplicate.getId())) {
            throw new IllegalArgumentException(
                "A complaint cannot be marked as its own duplicate."
            );
        }

        if (!isStillReviewable(complaint, possibleDuplicate)) {
            throw new IllegalArgumentException(
                "This potential duplicate is no longer available for review."
            );
        }

        if (decision == DuplicateReviewStatus.CONFIRMED_DUPLICATE) {

            confirmDuplicate(
                complaint,
                possibleDuplicate,
                moderator
            );

        } else if (decision == DuplicateReviewStatus.NOT_DUPLICATE) {

            markAsNotDuplicate(
                complaint,
                moderator
            );
        }

        duplicate.setReviewStatus(decision);
        duplicate.setReviewedBy(moderator);
        duplicate.setReviewedAt(LocalDateTime.now());

        duplicateRepository.save(duplicate);

        // If this was marked as NOT_DUPLICATE, check whether
        // any other potential matches are still awaiting review.

        if (decision == DuplicateReviewStatus.NOT_DUPLICATE) {
            updateDuplicateFlag(complaint);
        }
    }

    // CHECK WHETHER A DUPLICATE PAIR CAN STILL BE REVIEWED

    private boolean isStillReviewable(
            Complaint complaint,
            Complaint possibleDuplicate
    ) {

        if (complaint == null || possibleDuplicate == null) {
            return false;
        }

        // A complaint already linked to another complaint
        // must not appear in the review queue again.

        if (complaint.getPrimaryComplaint() != null ||
                possibleDuplicate.getPrimaryComplaint() != null) {
            return false;
        }

        // A confirmed duplicate cannot be reviewed again.

        if (complaint.getStatus() == ComplaintStatus.DUPLICATE ||
                possibleDuplicate.getStatus() == ComplaintStatus.DUPLICATE) {
            return false;
        }

        return true;
    }

    // CONFIRM DUPLICATE

    private void confirmDuplicate(
            Complaint complaint,
            Complaint primaryComplaint,
            Moderator moderator
    ) {

        if (complaint.getPrimaryComplaint() != null) {
            throw new IllegalArgumentException(
                "This complaint is already linked to another primary complaint."
            );
        }

        if (primaryComplaint.getPrimaryComplaint() != null ||
                primaryComplaint.getStatus() == ComplaintStatus.DUPLICATE) {

            throw new IllegalArgumentException(
                "The selected primary complaint is itself linked to another complaint."
            );
        }

        // Preserve both records and link the duplicate to the primary.

        complaint.setPrimaryComplaint(primaryComplaint);

        complaint.setStatus(ComplaintStatus.DUPLICATE);

        complaint.setDuplicateFlagged(true);

        complaintRepository.save(complaint);

        // Record the decision in the complaint timeline.

        complaintUpdateService.recordUpdate(
            complaint,
            ComplaintStatus.DUPLICATE,
            "Moderator confirmed this complaint as a duplicate of "
                + primaryComplaint.getComplaintCode()
                + ". Original complaint records have been preserved.",
            moderator
        );

        // Notify the citizen who submitted the duplicate report.

        notificationService.createNotification(
            complaint.getCitizen(),
            complaint,
            "Complaint marked as duplicate",
            "Your complaint " + complaint.getComplaintCode()
                + " has been linked to existing complaint "
                + primaryComplaint.getComplaintCode()
                + ". The original complaint will continue to be tracked.",
            "DUPLICATE_CONFIRMED"
        );

        // Notify the citizen who submitted the primary complaint.

        if (!complaint.getCitizen().getId().equals(
                primaryComplaint.getCitizen().getId())) {

            notificationService.createNotification(
                primaryComplaint.getCitizen(),
                primaryComplaint,
                "Additional report received",
                "Another citizen has reported a similar issue. "
                    + "Their complaint " + complaint.getComplaintCode()
                    + " has been linked to your complaint "
                    + primaryComplaint.getComplaintCode() + ".",
                "DUPLICATE_LINKED"
            );
        }
    }

    // MARK AS A SEPARATE COMPLAINT

    private void markAsNotDuplicate(
            Complaint complaint,
            Moderator moderator
    ) {

        complaintUpdateService.recordUpdate(
            complaint,
            complaint.getStatus(),
            "Moderator reviewed the potential duplicate and confirmed "
                + "that this is a separate complaint.",
            moderator
        );

        notificationService.createNotification(
            complaint.getCitizen(),
            complaint,
            "Complaint review completed",
            "Your complaint " + complaint.getComplaintCode()
                + " has been reviewed and will be handled as a separate issue.",
            "DUPLICATE_REJECTED"
        );
    }

    // UPDATE DUPLICATE FLAG AFTER ALL MATCHES ARE REVIEWED

    private void updateDuplicateFlag(Complaint complaint) {

        List<ComplaintDuplicate> remainingPending =
            duplicateRepository.findByComplaint_IdAndReviewStatus(
                complaint.getId(),
                DuplicateReviewStatus.PENDING
            );

        boolean hasPendingMatches = remainingPending.stream()
            .anyMatch(duplicate ->
                isStillReviewable(
                    duplicate.getComplaint(),
                    duplicate.getPossibleDuplicate()
                )
            );

        if (!hasPendingMatches) {
            complaint.setDuplicateFlagged(false);
            complaintRepository.save(complaint);
        }
    }

    // CONVERT ENTITY TO RESPONSE

    private ComplaintDuplicateResponse convertToResponse(
            ComplaintDuplicate duplicate
    ) {

        return new ComplaintDuplicateResponse(
            duplicate.getId(),
            convertComplaintToResponse(duplicate.getComplaint()),
            convertComplaintToResponse(duplicate.getPossibleDuplicate()),
            duplicate.getSimilarityScore(),
            duplicate.getDistanceMeters(),
            duplicate.getReviewStatus(),
            duplicate.getCreatedAt(),
            duplicate.getReviewedAt()
        );
    }

    // CONVERT COMPLAINT TO RESPONSE

    private ComplaintResponse convertComplaintToResponse(
            Complaint complaint
    ) {

        return new ComplaintResponse(
            complaint.getId(),
            complaint.getComplaintCode(),
            complaint.getCitizen().getFullName(),
            complaint.getCategory(),
            complaint.getDescription(),
            complaint.getLatitude(),
            complaint.getLongitude(),
            complaint.getAddress(),
            complaint.getStatus(),
            complaint.getDepartment() != null
                ? complaint.getDepartment().getName()
                : null,
            complaint.getCreatedAt(),
            complaint.getUpdatedAt(),
            complaint.getResolvedAt()
        );
    }
}
