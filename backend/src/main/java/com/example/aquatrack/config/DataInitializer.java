package com.example.aquatrack.config;

import com.example.aquatrack.model.*;
import com.example.aquatrack.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ApartmentRepository apartmentRepository;
    private final HouseholdRepository householdRepository;
    private final TariffPlanRepository tariffPlanRepository;
    private final WaterUsageLogRepository waterUsageLogRepository;
    private final BillingCycleRepository billingCycleRepository;
    private final InvoiceRepository invoiceRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           ApartmentRepository apartmentRepository,
                           HouseholdRepository householdRepository,
                           TariffPlanRepository tariffPlanRepository,
                           WaterUsageLogRepository waterUsageLogRepository,
                           BillingCycleRepository billingCycleRepository,
                           InvoiceRepository invoiceRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.apartmentRepository = apartmentRepository;
        this.householdRepository = householdRepository;
        this.tariffPlanRepository = tariffPlanRepository;
        this.waterUsageLogRepository = waterUsageLogRepository;
        this.billingCycleRepository = billingCycleRepository;
        this.invoiceRepository = invoiceRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            // Ensure all existing users have passwordHint populated for dynamic login reflection
            userRepository.findAll().forEach(u -> {
                if (u.getPasswordHint() == null || u.getPasswordHint().isEmpty()) {
                    u.setPasswordHint(u.getRole() == User.Role.ADMIN ? "admin123" : "resident123");
                    userRepository.save(u);
                }
            });
            return;
        }

        System.out.println(">>> Initializing fresh AquaTrack database with seed users and data...");

        // 1. Create Primary Admin User
        User primaryAdmin = new User();
        primaryAdmin.setUsername("admin");
        primaryAdmin.setEmail("admin@aquatrack.com");
        primaryAdmin.setPasswordHash(passwordEncoder.encode("admin123"));
        primaryAdmin.setPasswordHint("admin123");
        primaryAdmin.setDisplayName("Subhendu Ghosh (System Admin)");
        primaryAdmin.setRole(User.Role.ADMIN);
        primaryAdmin.setAuthProvider(User.AuthProvider.LOCAL);
        primaryAdmin = userRepository.save(primaryAdmin);

        // 2. Create Secondary Admin / Community Manager User
        User secondaryAdmin = new User();
        secondaryAdmin.setUsername("alex_admin");
        secondaryAdmin.setEmail("alex.admin@aquatrack.com");
        secondaryAdmin.setPasswordHash(passwordEncoder.encode("admin123"));
        secondaryAdmin.setPasswordHint("admin123");
        secondaryAdmin.setDisplayName("Alex Rivera (Community Manager)");
        secondaryAdmin.setRole(User.Role.ADMIN);
        secondaryAdmin.setAuthProvider(User.AuthProvider.LOCAL);
        userRepository.save(secondaryAdmin);

        // 3. Create Apartment Community
        Apartment apartment = new Apartment();
        apartment.setName("Ocean Heights Community");
        apartment.setAddress("124 Marine Drive, Bayview");
        apartment.setOwnerEmail("management@oceanheights.com");
        apartment.setOwnerPhone("+1-555-019-2834");
        apartment.setAdmin(primaryAdmin);
        apartment = apartmentRepository.save(apartment);

        // 4. Create Tariff Plan for Apartment
        TariffPlan tariffPlan = new TariffPlan();
        tariffPlan.setApartment(apartment);
        tariffPlan.setBaseRate(new BigDecimal("2.50"));
        tariffPlan.setBaseTierLimit(new BigDecimal("300.00"));
        tariffPlan.setExcessRate(new BigDecimal("4.50"));
        tariffPlan = tariffPlanRepository.save(tariffPlan);

        apartment.setTariffPlan(tariffPlan);
        apartmentRepository.save(apartment);

        // 5. Create 4 Household Flats & Resident Users (Total 6 users)
        Object[][] residentSpecs = new Object[][]{
                {"101", new BigDecimal("1200.00"), 3, "sarah_johnson", "sarah.j@example.com", "Sarah Johnson", "+1-555-0101"},
                {"102", new BigDecimal("950.00"), 2, "michael_chen", "michael.chen@example.com", "Michael Chen", "+1-555-0102"},
                {"201", new BigDecimal("1400.00"), 4, "priya_sharma", "priya.sharma@example.com", "Priya Sharma", "+1-555-0201"},
                {"202", new BigDecimal("1100.00"), 2, "david_miller", "david.m@example.com", "David Miller", "+1-555-0202"}
        };

        LocalDate now = LocalDate.now();

        for (Object[] spec : residentSpecs) {
            String flatNo = (String) spec[0];
            BigDecimal flatSize = (BigDecimal) spec[1];
            Integer occupancy = (Integer) spec[2];
            String username = (String) spec[3];
            String email = (String) spec[4];
            String displayName = (String) spec[5];
            String phone = (String) spec[6];

            Household h = new Household();
            h.setApartment(apartment);
            h.setFlatNumber(flatNo);
            h.setFlatSize(flatSize);
            h.setOccupancy(occupancy);
            h.setResidentEmail(email);
            h.setResidentPhone(phone);
            h.setHasWorkingMeter(true);
            h.setDailyUsageThreshold(new BigDecimal("450.00"));
            h = householdRepository.save(h);

            User resident = new User();
            resident.setUsername(username);
            resident.setEmail(email);
            resident.setPasswordHash(passwordEncoder.encode("resident123"));
            resident.setPasswordHint("resident123");
            resident.setDisplayName(displayName);
            resident.setRole(User.Role.RESIDENT);
            resident.setAuthProvider(User.AuthProvider.LOCAL);
            resident.setHousehold(h);
            userRepository.save(resident);

            // Add daily water usage logs for past 10 days
            for (int day = 10; day >= 1; day--) {
                LocalDate readingDate = now.minusDays(day);
                double baseVal = 180.0 + (occupancy * 40.0) + ((day * 7) % 35);
                WaterUsageLog log = new WaterUsageLog();
                log.setHousehold(h);
                log.setReadingDate(readingDate);
                log.setReadingValue(new BigDecimal(String.format("%.2f", baseVal)));
                log.setSource(WaterUsageLog.Source.MANUAL);
                waterUsageLogRepository.save(log);
            }
        }

        System.out.println(">>> Database seeded successfully with 6 full editable users (2 Admins, 4 Residents)!");
    }
}
