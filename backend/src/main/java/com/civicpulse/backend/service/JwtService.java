package com.civicpulse.backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationTime;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration}") long expirationTime
    ) {

        this.secretKey = Keys.hmacShaKeyFor(
            Decoders.BASE64.decode(secret)
        );

        this.expirationTime = expirationTime;
    }

    public String generateToken(
            UUID userId,
            String email,
            String role
    ) {

        Date now = new Date();

        Date expiration = new Date(
            now.getTime() + expirationTime
        );

        return Jwts.builder()
            .subject(userId.toString())
            .claim("email", email)
            .claim("role", role)
            .issuedAt(now)
            .expiration(expiration)
            .signWith(secretKey)
            .compact();
    }

    public Claims extractAllClaims(String token) {

        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public UUID extractUserId(String token) {

        return UUID.fromString(
            extractAllClaims(token).getSubject()
        );
    }

    public String extractEmail(String token) {

        return extractAllClaims(token).get("email", String.class);
    }

    public String extractRole(String token) {

        return extractAllClaims(token).get("role", String.class);
    }

    public boolean isTokenValid(String token) {

        try {
            Claims claims = extractAllClaims(token);

            return claims.getExpiration().after(new Date());

        } catch (Exception exception) {
            return false;
        }
    }
}