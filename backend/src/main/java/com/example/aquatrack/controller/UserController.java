package com.example.aquatrack.controller;

import com.example.aquatrack.dto.UserProfileResponse;
import com.example.aquatrack.dto.UserProfileUpdateRequest;
import com.example.aquatrack.dto.UserProfileUpdateResponse;
import com.example.aquatrack.model.User;
import com.example.aquatrack.repository.UserRepository;
import com.example.aquatrack.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + principal.getName()));

        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setDisplayName(user.getDisplayName());
        response.setRole(user.getRole().name());

        if (user.getHousehold() != null) {
            response.setApartmentName(user.getHousehold().getApartment().getName());
            response.setFlatNumber(user.getHousehold().getFlatNumber());
        }

        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UserProfileUpdateRequest request, Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + principal.getName()));

        if (!user.getUsername().equals(request.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                return ResponseEntity.badRequest().body("Username already taken");
            }
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty() &&
                !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body("Email already taken");
            }
        }

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setDisplayName(request.getDisplayName());

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword().trim()));
            user.setPasswordHint(request.getPassword().trim());
        }

        userRepository.save(user);

        // Generate a new token since credentials/info might have changed
        String newToken = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        UserProfileResponse profileResponse = new UserProfileResponse();
        profileResponse.setId(user.getId());
        profileResponse.setUsername(user.getUsername());
        profileResponse.setEmail(user.getEmail());
        profileResponse.setDisplayName(user.getDisplayName());
        profileResponse.setRole(user.getRole().name());
        profileResponse.setPasswordHint(user.getPasswordHint());

        if (user.getHousehold() != null) {
            profileResponse.setApartmentName(user.getHousehold().getApartment().getName());
            profileResponse.setFlatNumber(user.getHousehold().getFlatNumber());
        }

        UserProfileUpdateResponse response = new UserProfileUpdateResponse();
        response.setToken(newToken);
        response.setUsername(user.getDisplayName() != null && !user.getDisplayName().trim().isEmpty() ? user.getDisplayName() : user.getUsername());
        response.setRole(user.getRole().name());
        response.setProfile(profileResponse);

        return ResponseEntity.ok(response);
    }
}
