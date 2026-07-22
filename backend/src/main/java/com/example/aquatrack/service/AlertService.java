package com.example.aquatrack.service;

import com.example.aquatrack.model.Alert;
import com.example.aquatrack.model.Household;
import com.example.aquatrack.model.WaterUsageLog;
import com.example.aquatrack.repository.AlertRepository;
import com.example.aquatrack.repository.HouseholdRepository;
import com.example.aquatrack.repository.WaterUsageLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AlertService {

    private static final Logger logger = LoggerFactory.getLogger(AlertService.class);

    private final AlertRepository alertRepository;
    private final HouseholdRepository householdRepository;
    private final WaterUsageLogRepository waterUsageLogRepository;

    public AlertService(AlertRepository alertRepository,
                        HouseholdRepository householdRepository,
                        WaterUsageLogRepository waterUsageLogRepository) {
        this.alertRepository = alertRepository;
        this.householdRepository = householdRepository;
        this.waterUsageLogRepository = waterUsageLogRepository;
    }

    @Scheduled(cron = "0 0 2 * * ?") // 2:00 AM daily
    public void scheduledDailyScan() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        logger.info("Running scheduled daily water usage scan for date: {}", yesterday);
        scanForAlerts(yesterday);
    }

    @Transactional
    public void scanForAlerts(LocalDate scanDate) {
        List<Household> households = householdRepository.findAll();
        for (Household h : households) {
            scanHouseholdForAlerts(h, scanDate);
        }
    }

    @Transactional
    public void scanHouseholdForAlerts(Household h, LocalDate scanDate) {
        Optional<WaterUsageLog> logOpt = waterUsageLogRepository.findByHouseholdIdAndReadingDate(h.getId(), scanDate);
        if (logOpt.isEmpty()) {
            return;
        }

        WaterUsageLog currentLog = logOpt.get();
        BigDecimal usage = currentLog.getReadingValue();

        // 1. Check Configurable Daily Threshold
        if (usage.compareTo(h.getDailyUsageThreshold()) > 0) {
            String message = String.format("Flat %s has exceeded its configured daily water threshold of %.2f units. Recorded usage: %.2f units.",
                    h.getFlatNumber(), h.getDailyUsageThreshold(), usage);
            triggerAlert(h, Alert.AlertType.THRESHOLD_VIOLATION, message, scanDate, usage);
        }

        // 2. Check Statistical Outliers (2 standard deviations above historical average)
        List<WaterUsageLog> priorLogs = waterUsageLogRepository.findByHouseholdIdAndReadingDateBetween(
                h.getId(), scanDate.minusDays(30), scanDate.minusDays(1));

        if (priorLogs.size() >= 5) {
            BigDecimal sum = BigDecimal.ZERO;
            for (WaterUsageLog l : priorLogs) {
                sum = sum.add(l.getReadingValue());
            }
            BigDecimal mean = sum.divide(BigDecimal.valueOf(priorLogs.size()), 4, RoundingMode.HALF_UP);

            BigDecimal varianceSum = BigDecimal.ZERO;
            for (WaterUsageLog l : priorLogs) {
                BigDecimal diff = l.getReadingValue().subtract(mean);
                varianceSum = varianceSum.add(diff.multiply(diff));
            }
            BigDecimal variance = varianceSum.divide(BigDecimal.valueOf(priorLogs.size()), 6, RoundingMode.HALF_UP);
            
            double stdDevDouble = Math.sqrt(variance.doubleValue());
            BigDecimal stdDev = BigDecimal.valueOf(stdDevDouble);

            BigDecimal twoSigmaLimit = mean.add(stdDev.multiply(BigDecimal.valueOf(2)));

            if (usage.compareTo(twoSigmaLimit) > 0 && usage.subtract(mean).compareTo(BigDecimal.valueOf(5)) > 0) {
                String message = String.format("Potential water leak detected in flat %s! Yesterday's usage was %.2f units, which is 2σ above the average of %.2f units.",
                        h.getFlatNumber(), usage, mean);
                triggerAlert(h, Alert.AlertType.LEAK_SUSPECTED, message, scanDate, usage);
            }
        }
    }

    private void triggerAlert(Household h, Alert.AlertType type, String message, LocalDate date, BigDecimal value) {
        // Log in DB (In-app Notification)
        Alert alert = new Alert();
        alert.setHousehold(h);
        alert.setAlertType(type);
        alert.setMessage(message);
        alert.setReadingDate(date);
        alert.setReadingValue(value);
        alert.setIsRead(false);
        alertRepository.save(alert);

        // Log Mock Email Notification
        String recipient = h.getResidentEmail() != null ? h.getResidentEmail() : "no-resident-linked@example.com";
        logger.info("EMAIL SENT to [{}]: [AquaTrack Alert] - {}", recipient, message);
    }

    public List<Alert> getAlertsByApartment(Long apartmentId) {
        return alertRepository.findByApartmentId(apartmentId);
    }

    public List<Alert> getAlertsByHousehold(Long householdId) {
        return alertRepository.findByHouseholdIdOrderByReadingDateDesc(householdId);
    }

    @Transactional
    public Alert markAsRead(Long id) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Alert not found: " + id));
        alert.setIsRead(true);
        return alertRepository.save(alert);
    }
}
