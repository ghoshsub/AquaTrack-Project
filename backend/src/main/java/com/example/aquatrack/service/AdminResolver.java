package com.example.aquatrack.service;

import com.example.aquatrack.model.User;
import com.example.aquatrack.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class AdminResolver {

    private final UserRepository userRepository;

    public AdminResolver(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Returns the User entity for the currently authenticated principal.
     * Throws IllegalArgumentException if not found.
     */
    public User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found: " + username));
    }

    /**
     * Returns the admin User entity and validates the principal is an ADMIN.
     * Throws AccessDeniedException if not an ADMIN.
     */
    public User requireAdmin() {
        User user = getCurrentUser();
        if (user.getRole() != User.Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied: admin role required");
        }
        return user;
    }
}
