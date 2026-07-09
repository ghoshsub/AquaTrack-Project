package com.example.aquatrack.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Component
public class GoogleTokenVerifier {

    @Value("${google.client-id}")
    private String googleClientId;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public record GoogleUser(String googleId, String email, String name) {}

    public GoogleUser verify(String idToken) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken))
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new IllegalArgumentException("Invalid Google token");
            }

            JsonNode json = objectMapper.readTree(response.body());

            String audience = json.path("aud").asText();
            if (!googleClientId.equals(audience)) {
                throw new IllegalArgumentException("Google token was not issued for this app");
            }

            String googleId = json.path("sub").asText();
            String email = json.path("email").asText();
            String name = json.path("name").asText();
            return new GoogleUser(googleId, email, name);

        } catch (IOException | InterruptedException e) {
            throw new IllegalArgumentException("Could not verify Google token: " + e.getMessage());
        }
    }
}