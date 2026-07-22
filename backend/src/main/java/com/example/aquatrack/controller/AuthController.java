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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final EmailService emailService;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager,
                          JwtUtil jwtUtil,
                          GoogleTokenVerifier googleTokenVerifier,
                          EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.googleTokenVerifier = googleTokenVerifier;
        this.emailService = emailService;
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@Valid @RequestBody GoogleAuthRequest request) {

        GoogleTokenVerifier.GoogleUser googleUser = googleTokenVerifier.verify(request.getIdToken());
        User user = userRepository.findByGoogleId(googleUser.googleId())
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setUsername(googleUser.email());
                    newUser.setEmail(googleUser.email());
                    newUser.setDisplayName(googleUser.name());
                    newUser.setGoogleId(googleUser.googleId());
                    newUser.setAuthProvider(User.AuthProvider.GOOGLE);
                    newUser.setRole(User.Role.RESIDENT);
                    User saved = userRepository.save(newUser);
                    
                    // Send welcome email asynchronously/in separate flow
                    emailService.sendWelcomeEmail(saved);
                    return saved;
                });

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, user.getDisplayName() != null ? user.getDisplayName() : user.getUsername(), user.getRole().name()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username already taken");
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty() && userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already taken");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        userRepository.save(user);

        // Send welcome email
        emailService.sendWelcomeEmail(user);

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRole().name()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRole().name()));
    }
}