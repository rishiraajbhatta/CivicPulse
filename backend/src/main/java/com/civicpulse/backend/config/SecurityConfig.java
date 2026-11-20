package com.civicpulse.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // CORS CONFIGURATION

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        // Allow the local Next.js frontend.
        configuration.setAllowedOrigins(
            List.of(
                "http://localhost:3000",
                "http://127.0.0.1:3000"
            )
        );

        // Allow required HTTP methods.
        configuration.setAllowedMethods(
            List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
            )
        );

        // Allow required request headers, including JWT Authorization.
        configuration.setAllowedHeaders(
            List.of("*")
        );

        // Allow Authorization headers and credentials.
        configuration.setAllowCredentials(true);

        // Cache preflight response for one hour.
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
            "/**",
            configuration
        );

        return source;
    }

    // SECURITY FILTER CHAIN

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
            // Enable CORS.
            .cors(cors -> cors
                .configurationSource(corsConfigurationSource())
            )

            // Disable CSRF for stateless JWT authentication.
            .csrf(csrf -> csrf.disable())

            .formLogin(form -> form.disable())

            .httpBasic(basic -> basic.disable())

            // Use stateless authentication.
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // ENDPOINT AUTHORIZATION
            .authorizeHttpRequests(auth -> auth

                // Allow browser CORS preflight requests.
                .requestMatchers(
                    HttpMethod.OPTIONS,
                    "/**"
                ).permitAll()

                // Public endpoints.
                .requestMatchers(
                    "/api/health",
                    "/api/citizens/register",
                    "/api/citizens/login",
                    "/api/moderators/login"
                ).permitAll()

                // Public department listing.
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/departments"
                ).permitAll()

                // Moderator-only endpoints.
                .requestMatchers("/api/moderators/**")
                .hasRole("MODERATOR")

                // Citizen-only endpoints.
                .requestMatchers("/api/citizens/**")
                .hasRole("CITIZEN")

                // All remaining endpoints require authentication.
                .anyRequest().authenticated()
            )

            // Add JWT authentication filter.
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}
