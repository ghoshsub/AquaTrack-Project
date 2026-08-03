package com.example.aquatrack.controller;

import com.example.aquatrack.dto.BillingCycleRequest;
import com.example.aquatrack.dto.HouseholdUsagePreview;
import com.example.aquatrack.dto.InvoiceGenerationRequest;
import com.example.aquatrack.model.BillingCycle;
import com.example.aquatrack.model.Invoice;
import com.example.aquatrack.service.BillingService;
import com.example.aquatrack.service.PdfService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/admin/billing")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBillingController {

    private final BillingService billingService;
    private final PdfService pdfService;

    public AdminBillingController(BillingService billingService, PdfService pdfService) {
        this.billingService = billingService;
        this.pdfService = pdfService;
    }

    @PostMapping("/cycles")
    public ResponseEntity<BillingCycle> openCycle(@Valid @RequestBody BillingCycleRequest request) {
        return ResponseEntity.ok(billingService.openBillingCycle(request));
    }

    @GetMapping("/cycles/apartment/{apartmentId}")
    public ResponseEntity<List<BillingCycle>> getCycles(@PathVariable Long apartmentId) {
        return ResponseEntity.ok(billingService.getBillingCyclesByApartment(apartmentId));
    }

    @GetMapping("/cycles/{id}")
    public ResponseEntity<BillingCycle> getCycleDetails(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.getBillingCycleDetails(id));
    }

    @PostMapping("/cycles/{id}/finalize")
    public ResponseEntity<BillingCycle> finalizeCycle(
            @PathVariable Long id,
            @RequestBody InvoiceGenerationRequest request) {
        return ResponseEntity.ok(billingService.finalizeBillingCycle(id, request));
    }

    @GetMapping("/cycles/{id}/usage-previews")
    public ResponseEntity<List<HouseholdUsagePreview>> getUsagePreviews(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.getUsagePreviewsForCycle(id));
    }

    @PostMapping("/cycles/{id}/archive")
    public ResponseEntity<BillingCycle> archiveCycle(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.archiveBillingCycle(id));
    }

    @PutMapping("/invoices/{id}/adjustments")
    public ResponseEntity<Invoice> updateInvoiceAdjustments(
            @PathVariable Long id,
            @RequestParam("adjustments") BigDecimal adjustments) {
        return ResponseEntity.ok(billingService.updateInvoiceAdjustments(id, adjustments));
    }

    @GetMapping("/cycles/{id}/invoices")
    public ResponseEntity<List<Invoice>> getInvoicesByCycle(@PathVariable Long id) {
        return ResponseEntity.ok(billingService.getInvoicesByCycle(id));
    }

    @GetMapping("/invoices/{id}/receipt")
    public ResponseEntity<byte[]> downloadInvoiceReceipt(@PathVariable Long id) {
        Invoice invoice = billingService.getInvoiceById(id);
        byte[] pdfBytes = pdfService.generateInvoicePdf(invoice);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "receipt-" + id + ".pdf");
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}

