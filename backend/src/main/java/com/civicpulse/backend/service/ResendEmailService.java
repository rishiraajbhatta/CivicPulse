package com.civicpulse.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ResendEmailService {

    private static final Logger logger =
        LoggerFactory.getLogger(ResendEmailService.class);

    private static final String BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String brevoApiKey;
    private final String senderEmail;

    public ResendEmailService(
            ObjectMapper objectMapper,
            @Value("${BREVO_API_KEY:}") String brevoApiKey,
            @Value("${BREVO_SENDER_EMAIL:${spring.mail.username:}}") String senderEmail
    ) {
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
        this.objectMapper = objectMapper;
        this.brevoApiKey = brevoApiKey;
        this.senderEmail = senderEmail;
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

        if (brevoApiKey == null || brevoApiKey.isBlank()) {
            logger.warn("Email not sent: BREVO_API_KEY is not configured.");
            return false;
        }

        if (senderEmail == null || senderEmail.isBlank()) {
            logger.warn("Email not sent: BREVO_SENDER_EMAIL is not configured.");
            return false;
        }

        try {
            String plainText = (textContent != null && !textContent.isBlank())
                ? textContent
                : subject;
            String html = (htmlContent != null && !htmlContent.isBlank())
                ? htmlContent
                : "<p>" + plainText + "</p>";

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("sender", Map.of(
                "name", "CivicPulse",
                "email", senderEmail.trim()
            ));
            payload.put("to", List.of(Map.of(
                "email", recipient.trim()
            )));
            payload.put("replyTo", Map.of(
                "name", "CivicPulse",
                "email", senderEmail.trim()
            ));
            payload.put("subject", subject);
            payload.put("htmlContent", html);
            payload.put("textContent", plainText);

            String jsonBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BREVO_ENDPOINT))
                .timeout(Duration.ofSeconds(15))
                .header("accept", "application/json")
                .header("content-type", "application/json")
                .header("api-key", brevoApiKey.trim())
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

            HttpResponse<String> response = httpClient.send(
                request,
                HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                logger.info(
                    "Email successfully sent via Brevo HTTPS API to {} (status {})",
                    recipient,
                    response.statusCode()
                );
                return true;
            } else {
                logger.error(
                    "Failed to send email via Brevo API to {}: HTTP {} - {}",
                    recipient,
                    response.statusCode(),
                    response.body()
                );
                return false;
            }
        } catch (Exception exception) {
            logger.error(
                "Exception sending email via Brevo API to {}: {}",
                recipient,
                exception.getMessage()
            );
            return false;
        }
    }
}
