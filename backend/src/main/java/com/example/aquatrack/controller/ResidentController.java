package com.example.aquatrack.controller;

import com.example.aquatrack.dto.LinkHouseholdRequest;
import com.example.aquatrack.dto.ResidentDashboardResponse;
import com.example.aquatrack.model.Apartment;
import com.example.aquatrack.model.Household;
import com.example.aquatrack.model.User;
import com.example.aquatrack.model.WaterUsageLog;
import com.example.aquatrack.service.ApartmentService;
import com.example.aquatrack.repository.HouseholdRepository;
import com.example.aquatrack.repository.UserRepository;
import com.example.aquatrack.repository.WaterUsageLogRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/resident")
@PreAuthorize("hasRole('RESIDENT')")
public class ResidentController {

    private final UserRepository userRepository;
    private final HouseholdRepository householdRepository;
    private final WaterUsageLogRepository usageLogRepository;
    private final ApartmentService apartmentService;

    public ResidentController(UserRepository userRepository,
                              HouseholdRepository householdRepository,
                              WaterUsageLogRepository usageLogRepository,
                              ApartmentService apartmentService) {
        this.userRepository = userRepository;
        this.householdRepository = householdRepository;
        this.usageLogRepository = usageLogRepository;
        this.apartmentService = apartmentService;
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Current user not found"));
    }

    @GetMapping("/apartments")
    public ResponseEntity<List<Apartment>> getApartments() {
        return ResponseEntity.ok(apartmentService.findAllForResidents());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ResidentDashboardResponse> getDashboard() {
        User user = getCurrentUser();
        ResidentDashboardResponse response = new ResidentDashboardResponse();
        
        Household household = user.getHousehold();
        if (household == null) {
            response.setLinked(false);
            return ResponseEntity.ok(response);
        }

        response.setLinked(true);
        response.setApartmentName(household.getApartment().getName());
        response.setFlatNumber(household.getFlatNumber());

        // Get logs for the current month
        YearMonth currentMonth = YearMonth.now();
        LocalDate startOfMonth = currentMonth.atDay(1);
        LocalDate endOfMonth = currentMonth.atEndOfMonth();

        List<WaterUsageLog> logs = usageLogRepository.findByHouseholdIdAndReadingDateBetween(
                household.getId(), startOfMonth, endOfMonth);
        
        response.setDailyLogs(logs);

        // Calculate total for the month
        BigDecimal total = logs.stream()
                .map(WaterUsageLog::getReadingValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        response.setCurrentMonthUsage(total);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/link-household")
    @Transactional
    public ResponseEntity<?> linkHousehold(@Valid @RequestBody LinkHouseholdRequest request) {
        User user = getCurrentUser();
        
        if (user.getHousehold() != null) {
            return ResponseEntity.badRequest().body("User is already linked to a household.");
        }

        Household household = householdRepository.findByApartmentIdAndFlatNumber(
                request.getApartmentId(), request.getFlatNumber()
        ).orElseThrow(() -> new IllegalArgumentException("Household not found for the given apartment and flat number."));

        if (household.getUser() != null) {
            return ResponseEntity.badRequest().body("This flat is already linked to another resident.");
        }

        user.setHousehold(household);
        household.setUser(user);
        userRepository.saveAndFlush(user);

        return ResponseEntity.ok("Successfully linked to flat " + request.getFlatNumber());
    }
}
