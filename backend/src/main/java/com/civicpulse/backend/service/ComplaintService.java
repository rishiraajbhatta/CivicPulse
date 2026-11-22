package com.civicpulse.backend.service;

import com.civicpulse.backend.dto.ComplaintCreateRequest;
import com.civicpulse.backend.dto.UpvoteResponse;
import com.civicpulse.backend.dto.ComplaintResponse;

import com.civicpulse.backend.entity.Citizen;
import com.civicpulse.backend.entity.Complaint;
import com.civicpulse.backend.entity.ComplaintStatus;
import com.civicpulse.backend.entity.ComplaintUpvote;
import com.civicpulse.backend.entity.Moderator;

import com.civicpulse.backend.repository.ComplaintRepository;
import com.civicpulse.backend.repository.ComplaintUpvoteRepository;
import com.civicpulse.backend.repository.ModeratorRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.security.SecureRandom;
import java.time.Year;
import java.util.List;
import java.util.UUID;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintUpvoteRepository complaintUpvoteRepository;
    private final ModeratorRepository moderatorRepository;
    private final ResendEmailService resendEmailService;
    private final DuplicateDetectionService duplicateDetectionService;
    private final NotificationService notificationService;

    private final SecureRandom secureRandom = new SecureRandom();

    public ComplaintService(
            ComplaintRepository complaintRepository,
            ComplaintUpvoteRepository complaintUpvoteRepository,
            ModeratorRepository moderatorRepository,
            ResendEmailService resendEmailService,
            DuplicateDetectionService duplicateDetectionService,
            NotificationService notificationService
    ) {
        this.complaintRepository = complaintRepository;
        this.complaintUpvoteRepository = complaintUpvoteRepository;
        this.moderatorRepository = moderatorRepository;
        this.resendEmailService = resendEmailService;
        this.duplicateDetectionService = duplicateDetectionService;
        this.notificationService = notificationService;
    }

    // CREATE COMPLAINT
    @Transactional
    public ComplaintResponse createComplaint(
            ComplaintCreateRequest request,
            Citizen citizen
    ) {

        Complaint complaint = new Complaint();

        complaint.setComplaintCode(generateComplaintCode());
        complaint.setCitizen(citizen);
        complaint.setCategory(request.getCategory());
        complaint.setDescription(request.getDescription().trim());
        complaint.setLatitude(request.getLatitude());
        complaint.setLongitude(request.getLongitude());
        complaint.setAddress(request.getAddress());

        Complaint savedComplaint = complaintRepository.save(complaint);

        // AUTOMATIC DUPLICATE DETECTION
        duplicateDetectionService.detectDuplicates(savedComplaint);

        // NOTIFY ALL ACTIVE MODERATORS
        List<Moderator> activeModerators =
                moderatorRepository.findByActiveTrue();

        String notificationTitle = "New complaint received";

        String notificationMessage =
                "A new " + savedComplaint.getCategory()
                + " complaint has been submitted. Complaint ID: "
                + savedComplaint.getComplaintCode();

        for (Moderator moderator : activeModerators) {

            notificationService.createModeratorNotification(
                    moderator,
                    savedComplaint,
                    notificationTitle,
                    notificationMessage,
                    "NEW_COMPLAINT"
            );
        }

        ComplaintResponse response = convertToResponse(savedComplaint);

        // Send confirmation email only after database commit.
        TransactionSynchronizationManager.registerSynchronization(
            new TransactionSynchronization() {

                @Override
                public void afterCommit() {
                    sendComplaintConfirmationEmail(savedComplaint);
                }
            }
        );

        return response;
    }

    // SEND COMPLAINT CONFIRMATION EMAIL
    private void sendComplaintConfirmationEmail(Complaint complaint) {

        String citizenName = complaint.getCitizen().getFullName();
        String recipient = complaint.getCitizen().getEmail();
        String complaintCode = complaint.getComplaintCode();
        String category = complaint.getCategory().toString();

        String address = complaint.getAddress() != null
            ? complaint.getAddress()
            : "Location details provided during submission";

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
                            Complaint Submitted Successfully!
                        </h2>

                        <p>Hello %s,</p>

                        <p>
                            Thank you for reporting an issue in your area.
                            Your complaint has been successfully registered
                            with CivicPulse.
                        </p>

                        <div style="background:#ecfdf5;padding:20px;
                            border-radius:12px;margin:25px 0;">

                            <p style="margin:0;color:#065f46;">
                                YOUR COMPLAINT TRACKING ID
                            </p>

                            <h2 style="margin:10px 0;color:#047857;">
                                %s
                            </h2>

                            <p>
                                <strong>Category:</strong> %s
                            </p>

                            <p>
                                <strong>Location:</strong> %s
                            </p>

                            <p>
                                <strong>Status:</strong>
                                SUBMITTED
                            </p>
                        </div>

                        <p>
                            You can use your complaint tracking ID to
                            follow its progress through CivicPulse.
                        </p>

                        <p>
                            We appreciate your effort in making your
                            community a better place.
                        </p>

                        <p style="margin-top:30px;">
                            Regards,<br>
                            <strong>CivicPulse Team</strong>
                        </p>

                    </div>

                    <div style="background:#f0fdf4;padding:18px;
                        text-align:center;color:#64748b;font-size:12px;">

                        This is an automated confirmation email.
                        Please do not reply.

                    </div>

                </div>
            </body>
            </html>
            """.formatted(
                escapeHtml(citizenName),
                escapeHtml(complaintCode),
                escapeHtml(category),
                escapeHtml(address)
            );

        String textContent = """
            CivicPulse - Complaint Submitted Successfully!

            Hello %s,

            Your complaint has been successfully registered.

            Complaint ID: %s
            Category: %s
            Location: %s
            Status: SUBMITTED

            You can use your complaint ID to track its progress.

            Thank you for helping improve your community.

            Regards,
            CivicPulse Team
            """.formatted(
                citizenName,
                complaintCode,
                category,
                address
            );

        resendEmailService.sendEmail(
            recipient,
            "CivicPulse - Complaint Submitted (" + complaintCode + ")",
            htmlContent,
            textContent
        );
    }

    // BASIC HTML ESCAPING
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

    // GET CITIZEN COMPLAINTS
    @Transactional(readOnly = true)
    public List<ComplaintResponse> getCitizenComplaints(
            Citizen citizen
    ) {

        return complaintRepository
            .findByCitizen_IdOrderByCreatedAtDesc(citizen.getId())
            .stream()
            .map(this::convertToResponse)
            .toList();
    }

    // GENERATE UNIQUE COMPLAINT ID
    private String generateComplaintCode() {

        String complaintCode;

        do {
            int number = 100000 + secureRandom.nextInt(900000);

            complaintCode = "CP-" + Year.now().getValue() + "-" + number;

        } while (complaintRepository.existsByComplaintCode(complaintCode));

        return complaintCode;
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

    // UPVOTE / SUPPORT AN EXISTING COMPLAINT
    @Transactional
    public UpvoteResponse upvoteComplaint(UUID complaintId, Citizen citizen) {
        Complaint complaint = complaintRepository.findById(complaintId)
            .orElseThrow(() -> new IllegalArgumentException("Complaint not found."));

        if (complaint.getCitizen().getId().equals(citizen.getId())) {
            throw new IllegalArgumentException("You already reported this issue.");
        }

        if (complaint.getStatus() == ComplaintStatus.RESOLVED ||
                complaint.getStatus() == ComplaintStatus.REJECTED ||
                complaint.getStatus() == ComplaintStatus.DUPLICATE) {
            throw new IllegalArgumentException("This complaint is no longer open for upvotes.");
        }

        if (complaintUpvoteRepository.existsByComplaint_IdAndCitizen_Id(complaintId, citizen.getId())) {
            throw new IllegalArgumentException("You have already upvoted this complaint.");
        }

        ComplaintUpvote upvote = new ComplaintUpvote();
        upvote.setComplaint(complaint);
        upvote.setCitizen(citizen);
        complaintUpvoteRepository.save(upvote);

        int updatedCount = Math.max(complaint.getUpvoteCount(), 1) + 1;
        complaint.setUpvoteCount(updatedCount);
        complaintRepository.save(complaint);

        // Notify active moderators about increased citizen impact
        List<Moderator> activeModerators = moderatorRepository.findByActiveTrue();
        for (Moderator moderator : activeModerators) {
            notificationService.createModeratorNotification(
                moderator,
                complaint,
                "Additional citizen affected (" + updatedCount + " total)",
                "Another citizen confirmed the same " + complaint.getCategory()
                    + " issue on " + complaint.getComplaintCode()
                    + ". Total citizens affected: " + updatedCount + ".",
                "COMPLAINT_UPVOTED"
            );
        }

        return new UpvoteResponse(
            complaint.getId(),
            complaint.getComplaintCode(),
            updatedCount,
            "Your support has been added to " + complaint.getComplaintCode() + "."
        );
    }

    // GET COMPLAINTS UPVOTED BY CITIZEN
    @Transactional(readOnly = true)
    public List<ComplaintResponse> getUpvotedComplaints(Citizen citizen) {
        return complaintUpvoteRepository
            .findByCitizen_IdOrderByCreatedAtDesc(citizen.getId())
            .stream()
            .map(upvote -> convertToResponse(upvote.getComplaint()))
            .toList();
    }
}
