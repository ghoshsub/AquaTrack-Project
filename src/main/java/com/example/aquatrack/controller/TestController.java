package com.example.aquatrack.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.aquatrack.security.CustomUserDetails;

@RestController
public class TestController {

    @GetMapping("/api/admin/ping")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminPing(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return "Hello ADMIN " + currentUser.getUsername() + " — you're authorized.";
    }

    @GetMapping("/api/resident/ping")
    @PreAuthorize("hasRole('RESIDENT')")
    public String residentPing(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return "Hello RESIDENT " + currentUser.getUsername() + " — you're authorized.";
    }
}