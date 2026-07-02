package com.example.aquatrack.repository;

import com.example.aquatrack.model.WaterUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WaterUsageLogRepository extends JpaRepository<WaterUsageLog, Long> {

    List<WaterUsageLog> findByHouseholdIdOrderByReadingDateAsc(Long householdId);

    List<WaterUsageLog> findByHouseholdIdAndReadingDateBetween(
            Long householdId, LocalDate startDate, LocalDate endDate);

    Optional<WaterUsageLog> findByHouseholdIdAndReadingDate(Long householdId, LocalDate readingDate);

    boolean existsByHouseholdIdAndReadingDate(Long householdId, LocalDate readingDate);
}