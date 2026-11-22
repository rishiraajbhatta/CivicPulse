package com.civicpulse.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class ResendEmailService {

    private static final Logger logger =
        LoggerFactory.getLogger(ResendEmailService.class);

    private static final String BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

    private final HttpClient httpClient;
    private final String brevoApiKey;
    private final String senderEmail;

    public ResendEmailService(
            @Value("${BREVO_API_KEY:}") String brevoApiKey,
            @Value("${BREVO_SENDER_EMAIL:${spring.mail.username:}}") String senderEmail
    ) {
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
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

            String cleanSender = senderEmail.trim();
            String cleanRecipient = recipient.trim();

            String jsonBody = "{"
                + "\"sender\":{\"name\":\"CivicPulse\",\"email\":" + jsonString(cleanSender) + "},"
                + "\"to\":[{\"email\":" + jsonString(cleanRecipient) + "}],"
                + "\"replyTo\":{\"name\":\"CivicPulse\",\"email\":" + jsonString(cleanSender) + "},"
                + "\"subject\":" + jsonString(subject) + ","
                + "\"htmlContent\":" + jsonString(html) + ","
                + "\"textContent\":" + jsonString(plainText)
                + "}";

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

    private static String jsonString(String value) {
        if (value == null) {
            return "null";
        }
        StringBuilder sb = new StringBuilder(value.length() + 16);
        sb.append('"');
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            switch (c) {
                case '"' -> sb.append("\\\"");
                case '\\' -> sb.append("\\\\");
                case '\b' -> sb.append("\\b");
                case '\f' -> sb.append("\\f");
                case '\n' -> sb.append("\\n");
                case '\r' -> sb.append("\\r");
                case '\t' -> sb.append("\\t");
                default -> {
                    if (c < 0x20) {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
                }
            }
        }
        sb.append('"');
        return sb.toString();
    }
}