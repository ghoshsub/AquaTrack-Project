package com.example.aquatrack.controller;

import com.example.aquatrack.model.Invoice;
import com.example.aquatrack.model.User;
import com.example.aquatrack.repository.UserRepository;
import com.example.aquatrack.service.BillingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/resident/billing")
@PreAuthorize("hasRole('RESIDENT')")
public class ResidentBillingController {

    private final BillingService billingService;
    private final UserRepository userRepository;

    public ResidentBillingController(BillingService billingService, UserRepository userRepository) {
        this.billingService = billingService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Current user not found"));
    }

    @GetMapping("/invoices")
    public ResponseEntity<List<Invoice>> getMyInvoices() {
        User user = getCurrentUser();
        if (user.getHousehold() == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(billingService.getInvoicesByHousehold(user.getHousehold().getId()));
    }
}
