package com.example.aquatrack.controller;

import com.example.aquatrack.model.Alert;
import com.example.aquatrack.model.User;
import com.example.aquatrack.repository.UserRepository;
import com.example.aquatrack.service.AlertService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;
    private final UserRepository userRepository;

    public AlertController(AlertService alertService, UserRepository userRepository) {
        this.alertService = alertService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Current user not found"));
    }

    @GetMapping
    public ResponseEntity<List<Alert>> getAlerts(@RequestParam(value = "apartmentId", required = false) Long apartmentId) {
        User user = getCurrentUser();
        if (user.getRole() == User.Role.ADMIN) {
            if (apartmentId == null) {
                return ResponseEntity.badRequest().build();
            }
            return ResponseEntity.ok(alertService.getAlertsByApartment(apartmentId));
        } else {
            if (user.getHousehold() == null) {
                return ResponseEntity.ok(Collections.emptyList());
            }
            return ResponseEntity.ok(alertService.getAlertsByHousehold(user.getHousehold().getId()));
        }
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Alert> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(alertService.markAsRead(id));
    }

    @PostMapping("/trigger-scan")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> triggerScan(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        alertService.scanForAlerts(date);
        return ResponseEntity.ok().build();
    }
}
