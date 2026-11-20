package com.civicpulse.backend.service;

import com.civicpulse.backend.dto.FeedbackRequest;
import com.civicpulse.backend.entity.Citizen;
import com.civicpulse.backend.entity.Complaint;
import com.civicpulse.backend.entity.ComplaintStatus;
import com.civicpulse.backend.entity.Feedback;
import com.civicpulse.backend.repository.ComplaintRepository;
import com.civicpulse.backend.repository.FeedbackRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final ComplaintRepository complaintRepository;

    public FeedbackService(
            FeedbackRepository feedbackRepository,
            ComplaintRepository complaintRepository
    ) {
        this.feedbackRepository = feedbackRepository;
        this.complaintRepository = complaintRepository;
    }

    @Transactional
    public void submitFeedback(
            FeedbackRequest request,
            Citizen citizen
    ) {

        Complaint complaint = complaintRepository
            .findById(request.getComplaintId())
            .orElseThrow(() -> new IllegalArgumentException(
                "Complaint not found."
            ));

        if (!complaint.getCitizen().getId().equals(citizen.getId())) {
            throw new IllegalArgumentException(
                "You can only submit feedback for your own complaints."
            );
        }

        if (complaint.getStatus() != ComplaintStatus.RESOLVED) {
            throw new IllegalArgumentException(
                "Feedback can only be submitted for resolved complaints."
            );
        }

        if (feedbackRepository.existsByComplaint_Id(complaint.getId())) {
            throw new IllegalArgumentException(
                "Feedback has already been submitted for this complaint."
            );
        }

        Feedback feedback = new Feedback();

        feedback.setComplaint(complaint);
        feedback.setCitizen(citizen);
        feedback.setRating(request.getRating());
        feedback.setComments(request.getComments());

        feedbackRepository.save(feedback);
    }

    @Transactional(readOnly = true)
    public boolean hasSubmittedFeedback(
            UUID complaintId,
            Citizen citizen
    ) {

        Complaint complaint = complaintRepository
            .findById(complaintId)
            .orElseThrow(() -> new IllegalArgumentException(
                "Complaint not found."
            ));

        if (!complaint.getCitizen().getId().equals(citizen.getId())) {
            throw new IllegalArgumentException(
                "You can only check feedback for your own complaints."
            );
        }

        return feedbackRepository.existsByComplaint_Id(complaintId);
    }
}