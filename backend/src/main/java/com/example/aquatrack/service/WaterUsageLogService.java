package com.example.aquatrack.service;

import com.example.aquatrack.dto.UsageLogRequest;
import com.example.aquatrack.model.Household;
import com.example.aquatrack.model.User;
import com.example.aquatrack.model.WaterUsageLog;
import com.example.aquatrack.repository.HouseholdRepository;
import com.example.aquatrack.repository.WaterUsageLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.math.BigDecimal;
import com.example.aquatrack.dto.BulkUploadResponse;
import org.springframework.web.multipart.MultipartFile;

@Service
public class WaterUsageLogService {

    private final WaterUsageLogRepository usageLogRepository;
    private final HouseholdRepository householdRepository;
    private final AlertService alertService;
    private final AdminResolver adminResolver;

    public WaterUsageLogService(WaterUsageLogRepository usageLogRepository,
                                HouseholdRepository householdRepository,
                                AlertService alertService,
                                AdminResolver adminResolver) {
        this.usageLogRepository = usageLogRepository;
        this.householdRepository = householdRepository;
        this.alertService = alertService;
        this.adminResolver = adminResolver;
    }

    public WaterUsageLog logManualReading(UsageLogRequest request) {
        adminResolver.requireAdmin();
        Household household = householdRepository.findById(request.getHouseholdId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Household not found: " + request.getHouseholdId()));

        if (usageLogRepository.existsByHouseholdIdAndReadingDate(
                household.getId(), request.getReadingDate())) {
            throw new IllegalArgumentException(
                    "A reading already exists for this household on " + request.getReadingDate());
        }

        WaterUsageLog log = new WaterUsageLog();
        log.setHousehold(household);
        log.setReadingDate(request.getReadingDate());
        log.setReadingValue(request.getReadingValue());
        log.setSource(WaterUsageLog.Source.MANUAL);

        WaterUsageLog saved = usageLogRepository.save(log);
        alertService.scanHouseholdForAlerts(household, saved.getReadingDate());
        return saved;
    }

    public List<WaterUsageLog> getHistory(Long householdId) {
        return usageLogRepository.findByHouseholdIdOrderByReadingDateAsc(householdId);
    }

    public List<WaterUsageLog> getRange(Long householdId, LocalDate start, LocalDate end) {
        return usageLogRepository.findByHouseholdIdAndReadingDateBetween(householdId, start, end);
    }

    public BulkUploadResponse uploadBulkCsv(Long apartmentId, MultipartFile file) {
        User admin = adminResolver.requireAdmin();
        BulkUploadResponse response = new BulkUploadResponse();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean isFirstLine = true;
            int lineNumber = 0;
            
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.trim().isEmpty()) continue;
                
                if (isFirstLine) {
                    isFirstLine = false;
                    // Skip header if it looks like one
                    if (line.matches(".*[a-zA-Z]+.*")) {
                        continue;
                    }
                }
                
                String[] parts = line.split(",");
                if (parts.length < 3) {
                    response.getErrors().add("Line " + lineNumber + ": Invalid format. Expected flatNumber,date,value");
                    continue;
                }
                
                String flatNumber = parts[0].trim();
                String dateStr = parts[1].trim();
                String valueStr = parts[2].trim();
                
                try {
                    LocalDate date = LocalDate.parse(dateStr);
                    BigDecimal value = new BigDecimal(valueStr);
                    
                    // Scoped: look up household by flat number and verify apartment belongs to admin
                    Household household = householdRepository.findByApartmentIdAndFlatNumber(apartmentId, flatNumber).orElse(null);
                    if (household == null) {
                        response.getErrors().add("Line " + lineNumber + ": Flat " + flatNumber + " not found in apartment.");
                        continue;
                    }
                    // Ownership check
                    if (household.getApartment().getAdmin() == null || !household.getApartment().getAdmin().getId().equals(admin.getId())) {
                        response.getErrors().add("Line " + lineNumber + ": Access denied for flat " + flatNumber);
                        continue;
                    }
                    
                    if (usageLogRepository.existsByHouseholdIdAndReadingDate(household.getId(), date)) {
                        response.setSkippedDuplicates(response.getSkippedDuplicates() + 1);
                        continue;
                    }
                    
                    WaterUsageLog log = new WaterUsageLog();
                    log.setHousehold(household);
                    log.setReadingDate(date);
                    log.setReadingValue(value);
                    log.setSource(WaterUsageLog.Source.BULK_CSV);
                    WaterUsageLog saved = usageLogRepository.save(log);
                    alertService.scanHouseholdForAlerts(household, saved.getReadingDate());
                    
                    response.setSuccessful(response.getSuccessful() + 1);
                } catch (Exception e) {
                    response.getErrors().add("Line " + lineNumber + ": Failed to parse date or value. " + e.getMessage());
                }
            }
        } catch (Exception e) {
            response.getErrors().add("Failed to read file: " + e.getMessage());
        }
        return response;
    }
}