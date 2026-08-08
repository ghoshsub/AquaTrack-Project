package com.example.aquatrack.controller;

import com.example.aquatrack.dto.AuthResponse;
import com.example.aquatrack.dto.GoogleAuthRequest;
import com.example.aquatrack.dto.LoginRequest;
import com.example.aquatrack.dto.RegisterRequest;
import com.example.aquatrack.model.User;
import com.example.aquatrack.repository.UserRepository;
import com.example.aquatrack.security.GoogleTokenVerifier;
import com.example.aquatrack.security.JwtUtil;
import com.example.aquatrack.service.EmailService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final EmailService emailService;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil,
                          GoogleTokenVerifier googleTokenVerifier,
                          EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.googleTokenVerifier = googleTokenVerifier;
        this.emailService = emailService;
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleAuthRequest request) {

        GoogleTokenVerifier.GoogleUser googleUser = googleTokenVerifier.verify(request.getIdToken());
        User user = userRepository.findByGoogleId(googleUser.googleId())
                .orElseGet(() -> {
                    // Also check by email in case user previously registered with email
                    return userRepository.findByEmailIgnoreCase(googleUser.email())
                            .map(existingUser -> {
                                existingUser.setGoogleId(googleUser.googleId());
                                if (existingUser.getAuthProvider() == null) {
                                    existingUser.setAuthProvider(User.AuthProvider.GOOGLE);
                                }
                                return userRepository.save(existingUser);
                            })
                            .orElseGet(() -> {
                                User newUser = new User();
                                newUser.setUsername(googleUser.email());
                                newUser.setEmail(googleUser.email());
                                newUser.setDisplayName(googleUser.name());
                                newUser.setGoogleId(googleUser.googleId());
                                newUser.setAuthProvider(User.AuthProvider.GOOGLE);
                                newUser.setRole(User.Role.RESIDENT);
                                User saved = userRepository.save(newUser);
                                
                                emailService.sendWelcomeEmail(saved);
                                return saved;
                            });
                });

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, user.getDisplayName() != null ? user.getDisplayName() : user.getUsername(), user.getRole().name()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {

        if (userRepository.existsByUsernameIgnoreCase(request.getUsername().trim())) {
            return ResponseEntity.badRequest().body("Username already taken");
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String trimmedEmail = request.getEmail().trim();
            if (userRepository.existsByEmailIgnoreCase(trimmedEmail)) {
                return ResponseEntity.badRequest().body("Email already registered.");
            }
        }

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setAuthProvider(User.AuthProvider.LOCAL);

        userRepository.save(user);

        // Send welcome email
        emailService.sendWelcomeEmail(user);

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRole().name()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        String identifier = (request.getEmail() != null && !request.getEmail().trim().isEmpty())
                ? request.getEmail().trim()
                : (request.getUsername() != null ? request.getUsername().trim() : "");

        if (identifier.isEmpty()) {
            return ResponseEntity.badRequest().body("Email or username is required");
        }

        // Try lookup by email (case-insensitive) first, then by username (case-insensitive)
        java.util.Optional<User> userOpt = userRepository.findByEmailIgnoreCase(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsernameIgnoreCase(identifier);
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("No account found with this email.");
        }

        User user = userOpt.get();

        if (user.getPasswordHash() == null || user.getPasswordHash().isEmpty()) {
            return ResponseEntity.badRequest().body("This account was registered via Google Sign-In. Please sign in with Google.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRole().name()));
    }
}