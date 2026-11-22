package com.civicpulse.backend;

import com.civicpulse.backend.entity.Moderator;
import com.civicpulse.backend.repository.ModeratorRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.TimeZone;

@SpringBootApplication
public class BackendApplication {

    @PostConstruct
    public void initTimeZone() {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
    }

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    public CommandLineRunner seedDefaultModerator(
            ModeratorRepository moderatorRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            String defaultEmployeeId = "MOD-001";

            if (moderatorRepository.findByEmployeeId(defaultEmployeeId).isEmpty()) {
                Moderator moderator = new Moderator();
                moderator.setFullName("CivicPulse Admin Moderator");
                moderator.setEmail("moderator@civicpulse.local");
                moderator.setEmployeeId(defaultEmployeeId);
                moderator.setPassword(passwordEncoder.encode("Moderator@123"));
                moderator.setActive(true);

                moderatorRepository.save(moderator);
                System.out.println("Seeded default moderator account: " + defaultEmployeeId);
            }
        };
    }
}