package com.example.aquatrack.controller;

import com.example.aquatrack.model.Invoice;
import com.example.aquatrack.model.User;
import com.example.aquatrack.repository.UserRepository;
import com.example.aquatrack.service.BillingService;
import com.example.aquatrack.service.PdfService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    private final PdfService pdfService;

    public ResidentBillingController(BillingService billingService, UserRepository userRepository, PdfService pdfService) {
        this.billingService = billingService;
        this.userRepository = userRepository;
        this.pdfService = pdfService;
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

    @PostMapping("/invoices/{id}/pay")
    public ResponseEntity<?> payInvoice(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "UPI") String paymentMethod) {
        User user = getCurrentUser();
        if (user.getHousehold() == null) {
            return ResponseEntity.badRequest().body("User is not linked to any household.");
        }
        Invoice invoice = billingService.getInvoiceById(id);
        if (!invoice.getHousehold().getId().equals(user.getHousehold().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invoice does not belong to your household.");
        }
        try {
            Invoice paidInvoice = billingService.markInvoiceAsPaid(id, paymentMethod);
            return ResponseEntity.ok(paidInvoice);
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(java.util.Collections.singletonMap("error", ex.getMessage()));
        }
    }

    @GetMapping("/invoices/{id}/pdf")
    public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable Long id) {
        User user = getCurrentUser();
        if (user.getHousehold() == null) {
            return ResponseEntity.badRequest().build();
        }
        Invoice invoice = billingService.getInvoiceById(id);
        if (!invoice.getHousehold().getId().equals(user.getHousehold().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        byte[] pdfBytes = pdfService.generateInvoicePdf(invoice);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "invoice-" + id + ".pdf");
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
