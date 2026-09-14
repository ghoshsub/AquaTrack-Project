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
        user.setPasswordHint(request.getPassword());
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

    @GetMapping("/demo-credentials")
    public ResponseEntity<?> getDemoCredentials() {
        java.util.Map<String, Object> result = new java.util.HashMap<>();

        // Find primary admin (or first available admin)
        User admin = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.ADMIN)
                .findFirst()
                .orElse(null);

        // Find primary resident (or first available resident)
        User resident = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.RESIDENT)
                .findFirst()
                .orElse(null);

        if (admin != null) {
            java.util.Map<String, Object> adminData = new java.util.HashMap<>();
            adminData.put("id", admin.getId());
            adminData.put("username", admin.getUsername());
            adminData.put("displayName", admin.getDisplayName() != null ? admin.getDisplayName() : admin.getUsername());
            adminData.put("email", admin.getEmail());
            adminData.put("password", admin.getPasswordHint() != null ? admin.getPasswordHint() : "admin123");
            adminData.put("role", "ADMIN");
            result.put("admin", adminData);
        }

        if (resident != null) {
            java.util.Map<String, Object> residentData = new java.util.HashMap<>();
            residentData.put("id", resident.getId());
            residentData.put("username", resident.getUsername());
            residentData.put("displayName", resident.getDisplayName() != null ? resident.getDisplayName() : resident.getUsername());
            residentData.put("email", resident.getEmail());
            residentData.put("password", resident.getPasswordHint() != null ? resident.getPasswordHint() : "resident123");
            residentData.put("role", "RESIDENT");
            if (resident.getHousehold() != null) {
                residentData.put("flatNumber", resident.getHousehold().getFlatNumber());
                if (resident.getHousehold().getApartment() != null) {
                    residentData.put("apartmentName", resident.getHousehold().getApartment().getName());
                }
            }
            result.put("resident", residentData);
        }

        // Also include a summary of all users for quick inspection / login
        java.util.List<java.util.Map<String, Object>> allUsers = userRepository.findAll().stream().map(u -> {
            java.util.Map<String, Object> uMap = new java.util.HashMap<>();
            uMap.put("id", u.getId());
            uMap.put("username", u.getUsername());
            uMap.put("displayName", u.getDisplayName() != null ? u.getDisplayName() : u.getUsername());
            uMap.put("email", u.getEmail());
            uMap.put("role", u.getRole().name());
            uMap.put("password", u.getPasswordHint() != null ? u.getPasswordHint() : (u.getRole() == User.Role.ADMIN ? "admin123" : "resident123"));
            if (u.getHousehold() != null) {
                uMap.put("flatNumber", u.getHousehold().getFlatNumber());
                if (u.getHousehold().getApartment() != null) {
                    uMap.put("apartmentName", u.getHousehold().getApartment().getName());
                }
            }
            return uMap;
        }).collect(java.util.stream.Collectors.toList());

        result.put("allUsers", allUsers);

        return ResponseEntity.ok(result);
    }
}