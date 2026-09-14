package com.example.aquatrack.controller;

import com.example.aquatrack.dto.UserProfileResponse;

import com.example.aquatrack.model.Household;
import com.example.aquatrack.model.User;
import com.example.aquatrack.repository.HouseholdRepository;
import com.example.aquatrack.repository.UserRepository;
import com.example.aquatrack.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserRepository userRepository;
    private final HouseholdRepository householdRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AdminUserController(UserRepository userRepository,
                               HouseholdRepository householdRepository,
                               PasswordEncoder passwordEncoder,
                               JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.householdRepository = householdRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public ResponseEntity<List<UserProfileResponse>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserProfileResponse> responses = users.stream().map(user -> {
            UserProfileResponse response = new UserProfileResponse();
            response.setId(user.getId());
            response.setUsername(user.getUsername());
            response.setEmail(user.getEmail());
            response.setDisplayName(user.getDisplayName());
            response.setRole(user.getRole().name());
            response.setPasswordHint(user.getPasswordHint());
            if (user.getHousehold() != null) {
                response.setApartmentName(user.getHousehold().getApartment().getName());
                response.setFlatNumber(user.getHousehold().getFlatNumber());
            }
            return response;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setDisplayName(user.getDisplayName());
        response.setRole(user.getRole().name());
        response.setPasswordHint(user.getPasswordHint());
        if (user.getHousehold() != null) {
            response.setApartmentName(user.getHousehold().getApartment().getName());
            response.setFlatNumber(user.getHousehold().getFlatNumber());
        }

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> payload, Principal principal) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        String oldUsername = user.getUsername();
        boolean isSelf = (principal != null && principal.getName().equalsIgnoreCase(oldUsername));

        String username = (String) payload.get("username");
        String email = (String) payload.get("email");
        String displayName = (String) payload.get("displayName");
        String roleStr = (String) payload.get("role");
        String password = (String) payload.get("password");
        Object householdIdObj = payload.get("householdId");

        if (username != null && !username.trim().isEmpty() && !username.equals(user.getUsername())) {
            if (userRepository.existsByUsernameIgnoreCase(username.trim())) {
                return ResponseEntity.badRequest().body("Username is already taken");
            }
            user.setUsername(username.trim());
        }

        if (email != null && !email.trim().isEmpty() && !email.equals(user.getEmail())) {
            if (userRepository.existsByEmailIgnoreCase(email.trim())) {
                return ResponseEntity.badRequest().body("Email is already taken");
            }
            user.setEmail(email.trim());
        }

        if (displayName != null) {
            user.setDisplayName(displayName.trim());
        }

        if (roleStr != null) {
            try {
                user.setRole(User.Role.valueOf(roleStr.toUpperCase()));
            } catch (Exception ignored) {}
        }

        if (password != null && !password.trim().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(password.trim()));
            user.setPasswordHint(password.trim());
        }

        if (householdIdObj != null) {
            try {
                Long householdId = Long.parseLong(householdIdObj.toString());
                Household h = householdRepository.findById(householdId).orElse(null);
                user.setHousehold(h);
            } catch (Exception ignored) {}
        }

        userRepository.save(user);

        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setDisplayName(user.getDisplayName());
        response.setRole(user.getRole().name());
        response.setPasswordHint(user.getPasswordHint());
        if (user.getHousehold() != null) {
            response.setApartmentName(user.getHousehold().getApartment().getName());
            response.setFlatNumber(user.getHousehold().getFlatNumber());
        }

        // If the admin modified their own account, issue a refreshed JWT
        if (isSelf) {
            String newToken = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
            response.setToken(newToken);
        }

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        userRepository.delete(user);
        return ResponseEntity.ok().body("User deleted successfully");
    }
}
