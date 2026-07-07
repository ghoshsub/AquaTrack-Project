package com.example.aquatrack.service;

import com.example.aquatrack.dto.UsageLogRequest;
import com.example.aquatrack.model.Household;
import com.example.aquatrack.model.WaterUsageLog;
import com.example.aquatrack.repository.HouseholdRepository;
import com.example.aquatrack.repository.WaterUsageLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class WaterUsageLogService {

    private final WaterUsageLogRepository usageLogRepository;
    private final HouseholdRepository householdRepository;

    public WaterUsageLogService(WaterUsageLogRepository usageLogRepository,
                                HouseholdRepository householdRepository) {
        this.usageLogRepository = usageLogRepository;
        this.householdRepository = householdRepository;
    }

    public WaterUsageLog logManualReading(UsageLogRequest request) {
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

        return usageLogRepository.save(log);
    }

    public List<WaterUsageLog> getHistory(Long householdId) {
        return usageLogRepository.findByHouseholdIdOrderByReadingDateAsc(householdId);
    }

    public List<WaterUsageLog> getRange(Long householdId, LocalDate start, LocalDate end) {
        return usageLogRepository.findByHouseholdIdAndReadingDateBetween(householdId, start, end);
    }
}