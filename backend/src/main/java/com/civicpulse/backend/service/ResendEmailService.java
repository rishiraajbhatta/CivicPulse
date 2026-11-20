package com.civicpulse.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class ResendEmailService {

    private static final Logger logger =
        LoggerFactory.getLogger(ResendEmailService.class);

    private static final String RESEND_API_URL =
        "https://api.resend.com/emails";

    private final RestClient restClient;
    private final String apiKey;
    private final String fromEmail;

    public ResendEmailService(
            @Value("${resend.api-key}") String apiKey,
            @Value("${resend.from-email}") String fromEmail
    ) {
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.restClient = RestClient.create();
    }

    public boolean sendEmail(
            String recipient,
            String subject,
            String htmlContent,
            String textContent
    ) {

        if (recipient == null || recipient.isBlank()) {
            logger.warn("Email not sent: recipient address is missing.");
            return false;
        }

        try {
            Map<String, Object> requestBody = new LinkedHashMap<>();

            requestBody.put("from", fromEmail);
            requestBody.put("to", recipient);
            requestBody.put("subject", subject);
            requestBody.put("html", htmlContent);
            requestBody.put("text", textContent);

            restClient.post()
                .uri(RESEND_API_URL)
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .header("User-Agent", "CivicPulse-Backend/1.0")
                .body(requestBody)
                .retrieve()
                .toBodilessEntity();

            logger.info(
                "Email successfully sent to {}",
                recipient
            );

            return true;

        } catch (RestClientException exception) {

            logger.error(
                "Failed to send email to {}: {}",
                recipient,
                exception.getMessage()
            );

            return false;
        }
    }
}