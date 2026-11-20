package com.civicpulse.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/api/health")
    public Map<String, String> healthCheck() {

        Map<String, String> response = new HashMap<>();

        response.put("application", "CivicPulse");
        response.put("status", "Running");
        response.put("message", "CivicPulse backend is working successfully!");

        return response;
    }
}