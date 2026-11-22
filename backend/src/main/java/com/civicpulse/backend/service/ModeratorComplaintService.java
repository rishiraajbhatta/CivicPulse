package com.civicpulse.backend.service;

import com.civicpulse.backend.dto.ComplaintResponse;
import com.civicpulse.backend.dto.ComplaintStatusUpdateRequest;

import com.civicpulse.backend.entity.Citizen;
import com.civicpulse.backend.entity.Complaint;
import com.civicpulse.backend.entity.ComplaintUpvote;
import com.civicpulse.backend.entity.ComplaintImage;
import com.civicpulse.backend.entity.ComplaintStatus;
import com.civicpulse.backend.entity.Department;
import com.civicpulse.backend.entity.Moderator;

import com.civicpulse.backend.repository.ComplaintRepository;
import com.civicpulse.backend.repository.ComplaintUpvoteRepository;
import com.civicpulse.backend.repository.ComplaintImageRepository;
import com.civicpulse.backend.repository.DepartmentRepository;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ModeratorComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintUpvoteRepository complaintUpvoteRepository;
    private final ComplaintImageRepository complaintImageRepository;
    private final DepartmentRepository departmentRepository;
    private final ComplaintUpdateService complaintUpdateService;
    private final NotificationService notificationService;
    private final ResendEmailService resendEmailService;

    public ModeratorComplaintService(
            ComplaintRepository complaintRepository,
            ComplaintUpvoteRepository complaintUpvoteRepository,
            ComplaintImageRepository complaintImageRepository,
            DepartmentRepository departmentRepository,
            ComplaintUpdateService complaintUpdateService,
            NotificationService notificationService,
            ResendEmailService resendEmailService
    ) {
        this.complaintRepository = complaintRepository;
        this.complaintUpvoteRepository = complaintUpvoteRepository;
        this.complaintImageRepository = complaintImageRepository;
        this.departmentRepository = departmentRepository;
        this.complaintUpdateService = complaintUpdateService;
        this.notificationService = notificationService;
        this.resendEmailService = resendEmailService;
    }

    // GET ALL COMPLAINTS
    @Transactional(readOnly = true)
    public List<ComplaintResponse> getAllComplaints() {

        return complaintRepository
            .findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
            .stream()
            .map(this::convertToResponse)
            .toList();
    }

    // UPDATE COMPLAINT STATUS
    @Transactional
    public ComplaintResponse updateComplaint(
            UUID complaintId,
            ComplaintStatusUpdateRequest request,
            Moderator moderator
    ) {

        Complaint complaint = complaintRepository.findById(complaintId)
            .orElseThrow(() -> new IllegalArgumentException(
                "Complaint not found."
            ));

        ComplaintStatus newStatus = request.getStatus();

        if (newStatus == null) {
            throw new IllegalArgumentException(
                "A complaint status is required."
            );
        }

        // DUPLICATE status must only be assigned through duplicate review.
        if (newStatus == ComplaintStatus.DUPLICATE) {
            throw new IllegalArgumentException(
                "Use the duplicate review workflow to mark a complaint as duplicate."
            );
        }

        // Prevent changes to terminal complaints.
        if (complaint.getStatus() == ComplaintStatus.RESOLVED ||
                complaint.getStatus() == ComplaintStatus.REJECTED ||
                complaint.getStatus() == ComplaintStatus.DUPLICATE) {

            throw new IllegalArgumentException(
                "Resolved, rejected or duplicate complaints cannot be updated."
            );
        }

        // Validate rejection reason.
        if (newStatus == ComplaintStatus.REJECTED) {

            if (request.getRejectionReason() == null ||
                    request.getRejectionReason().isBlank()) {

                throw new IllegalArgumentException(
                    "A rejection reason is required."
                );
            }

            complaint.setRejectionReason(
                request.getRejectionReason().trim()
            );

        } else {
            complaint.setRejectionReason(null);
        }

        // Validate department assignment.
        if (request.getDepartmentId() != null) {

            Department department = departmentRepository
                .findById(request.getDepartmentId())
                .orElseThrow(() -> new IllegalArgumentException(
                    "Department not found."
                ));

            if (!department.isActive()) {
                throw new IllegalArgumentException(
                    "This department is currently inactive."
                );
            }

            complaint.setDepartment(department);

        } else if (newStatus == ComplaintStatus.ASSIGNED) {

            throw new IllegalArgumentException(
                "Select a department before assigning the complaint."
            );
        }

        // Require final proof before resolving.
        if (newStatus == ComplaintStatus.RESOLVED) {

            List<ComplaintImage> finalProof =
                complaintImageRepository
                    .findByComplaint_IdAndImageType(
                        complaintId,
                        "FINAL_PROOF"
                    );

            if (finalProof.isEmpty()) {
                throw new IllegalArgumentException(
                    "Upload a final resolution proof photo before marking this complaint as resolved."
                );
            }

            complaint.setResolvedAt(LocalDateTime.now());
        }

        complaint.setStatus(newStatus);
        complaint.setAssignedModerator(moderator);

        Complaint savedComplaint = complaintRepository.save(complaint);

        // Record status history.
        complaintUpdateService.recordUpdate(
            savedComplaint,
            newStatus,
            request.getRemarks(),
            moderator
        );

        // Create in-app notification.
        String title = getNotificationTitle(newStatus);

        String message = getNotificationMessage(
            savedComplaint,
            newStatus,
            request.getRemarks()
        );

        notificationService.createNotification(
            savedComplaint.getCitizen(),
            savedComplaint,
            title,
            message,
            "COMPLAINT_STATUS_UPDATE"
        );

        // Prepare email details before transaction completion.
        String recipient = savedComplaint.getCitizen().getEmail();
        String citizenName = savedComplaint.getCitizen().getFullName();
        String complaintCode = savedComplaint.getComplaintCode();

        String category = savedComplaint.getCategory().toString();

        String departmentName = savedComplaint.getDepartment() != null
            ? savedComplaint.getDepartment().getName()
            : "Not assigned";

        String rejectionReason = savedComplaint.getRejectionReason();
        String remarks = request.getRemarks();

        // Send email only after successful database commit.
        TransactionSynchronizationManager.registerSynchronization(
            new TransactionSynchronization() {

                @Override
                public void afterCommit() {

                    sendStatusUpdateEmail(
                        recipient,
                        citizenName,
                        complaintCode,
                        category,
                        newStatus,
                        departmentName,
                        rejectionReason,
                        remarks
                    );
                }
            }
        );

        return convertToResponse(savedComplaint);
    }

    // SEND STATUS UPDATE EMAIL
    private void sendStatusUpdateEmail(
            String recipient,
            String citizenName,
            String complaintCode,
            String category,
            ComplaintStatus status,
            String departmentName,
            String rejectionReason,
            String remarks
    ) {

        String statusText = status.name().replace("_", " ");

        String subject = switch (status) {
            case UNDER_REVIEW ->
                "CivicPulse - Your Complaint Is Under Review";
            case VERIFIED ->
                "CivicPulse - Your Complaint Has Been Verified";
            case ASSIGNED ->
                "CivicPulse - Department Assigned to Your Complaint";
            case IN_PROGRESS ->
                "CivicPulse - Work Has Started on Your Complaint";
            case RESOLVED ->
                "CivicPulse - Your Complaint Has Been Resolved!";
            case REJECTED ->
                "CivicPulse - Update Regarding Your Complaint";
            default ->
                "CivicPulse - Complaint Status Updated";
        };

        String details = "";

        if (status == ComplaintStatus.REJECTED) {

            details = "<p><strong>Rejection reason:</strong> "
                + escapeHtml(rejectionReason)
                + "</p>";

        } else if (remarks != null && !remarks.isBlank()) {

            details = "<p><strong>Moderator remarks:</strong> "
                + escapeHtml(remarks.trim())
                + "</p>";
        }

        String htmlContent = """
            <!DOCTYPE html>
            <html>
            <body style="margin:0;padding:30px;background:#f3f7f4;
                font-family:Arial,sans-serif;color:#1b3328;">

                <div style="max-width:600px;margin:auto;background:#ffffff;
                    border-radius:16px;overflow:hidden;">

                    <div style="background:#064e3b;padding:30px;
                        color:white;text-align:center;">

                        <h1 style="margin:0;font-size:28px;">
                            CivicPulse
                        </h1>

                        <p style="margin:10px 0 0;color:#d1fae5;">
                            Your city. Your voice. Real change.
                        </p>

                    </div>

                    <div style="padding:35px;">

                        <h2 style="color:#047857;">
                            Complaint Status Updated
                        </h2>

                        <p>Hello %s,</p>

                        <p>
                            There is an update regarding your reported
                            civic issue.
                        </p>

                        <div style="background:#ecfdf5;padding:20px;
                            border-radius:12px;margin:25px 0;">

                            <p style="margin:0;color:#065f46;">
                                COMPLAINT TRACKING ID
                            </p>

                            <h2 style="margin:10px 0;color:#047857;">
                                %s
                            </h2>

                            <p>
                                <strong>Category:</strong> %s
                            </p>

                            <p>
                                <strong>New status:</strong> %s
                            </p>

                            <p>
                                <strong>Department:</strong> %s
                            </p>

                        </div>

                        %s

                        <p>
                            Please visit CivicPulse to follow the progress
                            of your complaint.
                        </p>

                        <p style="margin-top:30px;">
                            Regards,<br>
                            <strong>CivicPulse Team</strong>
                        </p>

                    </div>

                    <div style="background:#f0fdf4;padding:18px;
                        text-align:center;color:#64748b;font-size:12px;">

                        This is an automated notification from CivicPulse.
                        Please do not reply.

                    </div>

                </div>
            </body>
            </html>
            """.formatted(
                escapeHtml(citizenName),
                escapeHtml(complaintCode),
                escapeHtml(category),
                escapeHtml(statusText),
                escapeHtml(departmentName),
                details
            );

        String textContent = """
            CivicPulse - Complaint Status Updated

            Hello %s,

            Your complaint status has been updated.

            Complaint ID: %s
            Category: %s
            New Status: %s
            Department: %s

            %s

            Please visit CivicPulse to follow your complaint.

            Regards,
            CivicPulse Team
            """.formatted(
                citizenName,
                complaintCode,
                category,
                statusText,
                departmentName,
                status == ComplaintStatus.REJECTED
                    ? "Rejection reason: " + rejectionReason
                    : (remarks != null ? "Moderator remarks: " + remarks : "")
            );

        resendEmailService.sendEmail(
            recipient,
            subject,
            htmlContent,
            textContent
        );
    }

    // HTML ESCAPING
    private String escapeHtml(String value) {

        if (value == null) {
            return "";
        }

        return value
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;");
    }

    // NOTIFICATION TITLE
    private String getNotificationTitle(ComplaintStatus status) {

        return switch (status) {
            case UNDER_REVIEW -> "Complaint Under Review";
            case VERIFIED -> "Complaint Verified";
            case ASSIGNED -> "Department Assigned";
            case IN_PROGRESS -> "Work In Progress";
            case RESOLVED -> "Complaint Resolved";
            case REJECTED -> "Complaint Rejected";
            default -> "Complaint Status Updated";
        };
    }

    // NOTIFICATION MESSAGE
    private String getNotificationMessage(
            Complaint complaint,
            ComplaintStatus status,
            String remarks
    ) {

        String message = "Your complaint "
            + complaint.getComplaintCode()
            + " has been updated to "
            + status.name().replace("_", " ")
            + ".";

        if (complaint.getDepartment() != null) {
            message += " Department: "
                + complaint.getDepartment().getName()
                + ".";
        }

        if (status == ComplaintStatus.REJECTED) {
            message += " Reason: "
                + complaint.getRejectionReason();
        } else if (remarks != null && !remarks.isBlank()) {
            message += " Update: " + remarks.trim();
        }

        return message;
    }

    // CONVERT ENTITY TO RESPONSE
    private ComplaintResponse convertToResponse(Complaint complaint) {

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
            complaint.getResolvedAt(),
            complaint.getUpvoteCount()
        );
    }
}
