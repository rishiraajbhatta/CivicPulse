package com.civicpulse.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

@Service
public class ResendEmailService {

    private static final Logger logger =
        LoggerFactory.getLogger(ResendEmailService.class);

    private final JavaMailSender mailSender;
    private final String fromEmail;

    public ResendEmailService(
            JavaMailSender mailSender,
            @Value("${spring.mail.username}") String fromEmail
    ) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
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

        if (fromEmail == null || fromEmail.isBlank()) {
            logger.warn("Email not sent: GMAIL_USERNAME is not configured.");
            return false;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                message,
                true,
                StandardCharsets.UTF_8.name()
            );

            helper.setFrom(new InternetAddress(fromEmail, "CivicPulse"));
            helper.setTo(recipient);
            helper.setSubject(subject);

            String plainText = (textContent != null && !textContent.isBlank())
                ? textContent
                : subject;
            String html = (htmlContent != null && !htmlContent.isBlank())
                ? htmlContent
                : plainText;

            helper.setText(plainText, html);

            mailSender.send(message);

            logger.info(
                "Email successfully sent via Gmail SMTP to {}",
                recipient
            );

            return true;

        } catch (MailException | MessagingException | UnsupportedEncodingException exception) {

            logger.error(
                "Failed to send email via Gmail SMTP to {}: {}",
                recipient,
                exception.getMessage()
            );

            return false;
        }
    }
}