package com.example.aquatrack.controller;

import com.example.aquatrack.dto.UsageLogRequest;
import com.example.aquatrack.model.WaterUsageLog;
import com.example.aquatrack.service.WaterUsageLogService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.aquatrack.dto.BulkUploadResponse;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/usage-logs")
public class WaterUsageLogController {

    private final WaterUsageLogService usageLogService;

    public WaterUsageLogController(WaterUsageLogService usageLogService) {
        this.usageLogService = usageLogService;
    }

    @PostMapping
    public ResponseEntity<WaterUsageLog> logReading(@Valid @RequestBody UsageLogRequest request) {
        return ResponseEntity.ok(usageLogService.logManualReading(request));
    }

    @GetMapping("/household/{householdId}")
    public ResponseEntity<List<WaterUsageLog>> history(@PathVariable Long householdId) {
        return ResponseEntity.ok(usageLogService.getHistory(householdId));
    }

    @GetMapping("/household/{householdId}/range")
    public ResponseEntity<List<WaterUsageLog>> range(
            @PathVariable Long householdId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(usageLogService.getRange(householdId, start, end));
    }

    @PostMapping("/bulk-upload")
    public ResponseEntity<BulkUploadResponse> uploadBulkCsv(
            @RequestParam("apartmentId") Long apartmentId,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(usageLogService.uploadBulkCsv(apartmentId, file));
    }
}