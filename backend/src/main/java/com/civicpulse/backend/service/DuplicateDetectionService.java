package com.civicpulse.backend.service;

import com.civicpulse.backend.entity.Complaint;
import com.civicpulse.backend.entity.ComplaintDuplicate;
import com.civicpulse.backend.entity.ComplaintStatus;
import com.civicpulse.backend.repository.ComplaintDuplicateRepository;
import com.civicpulse.backend.repository.ComplaintRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.Arrays;
import java.util.HashSet;
import java.util.stream.Collectors;

@Service
public class DuplicateDetectionService {

    private static final double SEARCH_RADIUS_METERS = 150.0;

    private static final double MIN_DESCRIPTION_SIMILARITY = 0.20;

    private static final double EARTH_RADIUS_METERS = 6371000.0;

    private final ComplaintRepository complaintRepository;

    private final ComplaintDuplicateRepository duplicateRepository;

    private static final List<ComplaintStatus> ACTIVE_STATUSES = List.of(
        ComplaintStatus.SUBMITTED,
        ComplaintStatus.UNDER_REVIEW,
        ComplaintStatus.VERIFIED,
        ComplaintStatus.ASSIGNED,
        ComplaintStatus.IN_PROGRESS
    );

    private static final Set<String> STOP_WORDS = Set.of(
        "the", "is", "are", "was", "were", "a", "an",
        "and", "or", "of", "in", "on", "at", "to",
        "for", "with", "near", "there", "this", "that",
        "it", "has", "have", "been", "be", "by",
        "from", "nearby", "area", "very", "my"
    );

    public DuplicateDetectionService(
            ComplaintRepository complaintRepository,
            ComplaintDuplicateRepository duplicateRepository
    ) {
        this.complaintRepository = complaintRepository;
        this.duplicateRepository = duplicateRepository;
    }

    // DETECT POTENTIAL DUPLICATES
    @Transactional
    public void detectDuplicates(Complaint newComplaint) {

        double latitude = newComplaint.getLatitude();
        double longitude = newComplaint.getLongitude();

        // Calculate geographical search boundaries.
        double latitudeDifference =
            SEARCH_RADIUS_METERS / 111320.0;

        double longitudeDifference =
            SEARCH_RADIUS_METERS /
            (111320.0 * Math.max(
                Math.abs(Math.cos(Math.toRadians(latitude))),
                0.01
            ));

        double minLatitude = latitude - latitudeDifference;
        double maxLatitude = latitude + latitudeDifference;

        double minLongitude = longitude - longitudeDifference;
        double maxLongitude = longitude + longitudeDifference;

        // Find nearby complaints in the same category.
        List<Complaint> nearbyComplaints =
            complaintRepository.findPotentialDuplicates(
                newComplaint.getId(),
                newComplaint.getCategory(),
                minLatitude,
                maxLatitude,
                minLongitude,
                maxLongitude,
                ACTIVE_STATUSES
            );

        boolean duplicateFound = false;

        for (Complaint existingComplaint : nearbyComplaints) {

            // Calculate actual geographical distance.
            double distance = calculateDistance(
                latitude,
                longitude,
                existingComplaint.getLatitude(),
                existingComplaint.getLongitude()
            );

            // Ignore complaints outside the search radius.
            if (distance > SEARCH_RADIUS_METERS) {
                continue;
            }

            // Calculate description similarity.
            double similarity = calculateSimilarity(
                newComplaint.getDescription(),
                existingComplaint.getDescription()
            );

            // Ignore descriptions that are insufficiently similar.
            if (similarity < MIN_DESCRIPTION_SIMILARITY) {
                continue;
            }

            // Prevent duplicate database entries.
            boolean alreadyExists =
                duplicateRepository
                    .existsByComplaint_IdAndPossibleDuplicate_Id(
                        newComplaint.getId(),
                        existingComplaint.getId()
                    );

            if (alreadyExists) {
                continue;
            }

            // Save potential duplicate match.
            ComplaintDuplicate duplicate = new ComplaintDuplicate();

            duplicate.setComplaint(newComplaint);
            duplicate.setPossibleDuplicate(existingComplaint);
            duplicate.setSimilarityScore(similarity);
            duplicate.setDistanceMeters(distance);

            duplicateRepository.save(duplicate);

            duplicateFound = true;
        }

        // Flag the new complaint if potential duplicates were found.
        if (duplicateFound) {

            newComplaint.setDuplicateFlagged(true);

            complaintRepository.save(newComplaint);
        }
    }

    // HAVERSINE DISTANCE CALCULATION
    private double calculateDistance(
            double latitude1,
            double longitude1,
            double latitude2,
            double longitude2
    ) {

        double lat1 = Math.toRadians(latitude1);
        double lat2 = Math.toRadians(latitude2);

        double latDifference =
            Math.toRadians(latitude2 - latitude1);

        double lonDifference =
            Math.toRadians(longitude2 - longitude1);

        double a =
            Math.sin(latDifference / 2) *
            Math.sin(latDifference / 2) +
            Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(lonDifference / 2) *
            Math.sin(lonDifference / 2);

        double c = 2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

        return EARTH_RADIUS_METERS * c;
    }

    // DESCRIPTION SIMILARITY CALCULATION
    private double calculateSimilarity(
            String description1,
            String description2
    ) {

        Set<String> words1 = extractKeywords(description1);

        Set<String> words2 = extractKeywords(description2);

        if (words1.isEmpty() && words2.isEmpty()) {
            return 1.0;
        }

        if (words1.isEmpty() || words2.isEmpty()) {
            return 0.0;
        }

        Set<String> intersection = new HashSet<>(words1);

        intersection.retainAll(words2);

        Set<String> union = new HashSet<>(words1);

        union.addAll(words2);

        return (double) intersection.size() / union.size();
    }

    // NORMALIZE AND EXTRACT DESCRIPTION KEYWORDS
    private Set<String> extractKeywords(String description) {

        if (description == null || description.isBlank()) {
            return Set.of();
        }

        return Arrays.stream(
                description
                    .toLowerCase(Locale.ROOT)
                    .replaceAll("[^a-z0-9\\s]", " ")
                    .split("\\s+")
            )
            .filter(word -> word.length() > 2)
            .filter(word -> !STOP_WORDS.contains(word))
            .collect(Collectors.toSet());
    }
}