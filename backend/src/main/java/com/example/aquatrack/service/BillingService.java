package com.example.aquatrack.service;

import com.example.aquatrack.dto.BillingCycleRequest;
import com.example.aquatrack.dto.HouseholdUsagePreview;
import com.example.aquatrack.dto.InvoiceGenerationRequest;
import com.example.aquatrack.model.*;
import com.example.aquatrack.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BillingService {

    private static final Logger logger = LoggerFactory.getLogger(BillingService.class);

    private final BillingCycleRepository billingCycleRepository;
    private final InvoiceRepository invoiceRepository;
    private final HouseholdRepository householdRepository;
    private final ApartmentRepository apartmentRepository;
    private final WaterUsageLogRepository waterUsageLogRepository;
    private final AlertRepository alertRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final AdminResolver adminResolver;

    public BillingService(BillingCycleRepository billingCycleRepository,
                          InvoiceRepository invoiceRepository,
                          HouseholdRepository householdRepository,
                          ApartmentRepository apartmentRepository,
                          WaterUsageLogRepository waterUsageLogRepository,
                          AlertRepository alertRepository,
                          UserRepository userRepository,
                          EmailService emailService,
                          AdminResolver adminResolver) {
        this.billingCycleRepository = billingCycleRepository;
        this.invoiceRepository = invoiceRepository;
        this.householdRepository = householdRepository;
        this.apartmentRepository = apartmentRepository;
        this.waterUsageLogRepository = waterUsageLogRepository;
        this.alertRepository = alertRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.adminResolver = adminResolver;
    }

    private LocalDate[] resolveDates(BillingCycleRequest request) {
        LocalDate start = request.getStartDate();
        LocalDate end = request.getEndDate();

        if ((start == null || end == null) && request.getMonth() != null && !request.getMonth().trim().isEmpty()) {
            try {
                java.time.YearMonth ym = java.time.YearMonth.parse(request.getMonth().trim());
                start = ym.atDay(1);
                end = ym.atEndOfMonth();
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid month format. Expected YYYY-MM");
            }
        }

        if (start == null || end == null) {
            throw new IllegalArgumentException("Please specify either a valid billing month (YYYY-MM) or start and end dates.");
        }

        return new LocalDate[]{start, end};
    }

    @Transactional
    public BillingCycle openBillingCycle(BillingCycleRequest request) {
        adminResolver.requireAdmin();

        Apartment apartment = apartmentRepository.findById(request.getApartmentId())
                .orElseThrow(() -> new IllegalArgumentException("Apartment not found: " + request.getApartmentId()));

        LocalDate[] dates = resolveDates(request);
        LocalDate startDate = dates[0];
        LocalDate endDate = dates[1];

        // Check if there is an active cycle for this exact period or overlapping — if so, regenerate it!
        List<BillingCycle> overlapping = billingCycleRepository.findOverlappingCycles(
                apartment.getId(), startDate, endDate);
        if (!overlapping.isEmpty()) {
            BillingCycle existing = overlapping.get(0);
            logger.info("Overlapping cycle found #{} for apartment {} ({}-{}) - regenerating.",
                    existing.getId(), apartment.getId(), startDate, endDate);
            return regenerateBillingCycle(existing.getId());
        }

        // Check if there is an active OPEN billing cycle for another month - reuse it with updated dates
        Optional<BillingCycle> existingOpen = billingCycleRepository.findByApartmentIdAndStatus(
                apartment.getId(), BillingCycle.Status.OPEN);
        if (existingOpen.isPresent()) {
            BillingCycle openCycle = existingOpen.get();
            openCycle.setStartDate(startDate);
            openCycle.setEndDate(endDate);
            return billingCycleRepository.save(openCycle);
        }

        BillingCycle cycle = new BillingCycle();
        cycle.setApartment(apartment);
        cycle.setStartDate(startDate);
        cycle.setEndDate(endDate);
        cycle.setStatus(BillingCycle.Status.OPEN);
        cycle.setTotalPurchasedVolume(BigDecimal.ZERO);
        cycle.setUnitCost(BigDecimal.ZERO);

        return billingCycleRepository.save(cycle);
    }

    @Transactional
    public BillingCycle updateBillingCycle(Long id, BillingCycleRequest request) {
        adminResolver.requireAdmin();
        BillingCycle cycle = billingCycleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Billing cycle not found: " + id));

        if (cycle.getStatus() != BillingCycle.Status.OPEN) {
            throw new IllegalStateException("Only OPEN billing cycles can be edited.");
        }

        LocalDate[] dates = resolveDates(request);
        cycle.setStartDate(dates[0]);
        cycle.setEndDate(dates[1]);

        return billingCycleRepository.save(cycle);
    }

    @Transactional
    public String sendInvoiceEmailToResident(Long invoiceId) {
        adminResolver.requireAdmin();
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + invoiceId));

        String recipient = null;
        if (invoice.getHousehold().getUser() != null && invoice.getHousehold().getUser().getEmail() != null && !invoice.getHousehold().getUser().getEmail().trim().isEmpty()) {
            recipient = invoice.getHousehold().getUser().getEmail();
        } else {
            recipient = invoice.getHousehold().getResidentEmail();
        }

        if (recipient == null || recipient.trim().isEmpty() || recipient.equals("no-resident-linked@example.com")) {
            throw new IllegalArgumentException("No valid recipient email address found for Flat " + invoice.getHousehold().getFlatNumber());
        }

        emailService.sendInvoiceEmail(invoice, recipient);
        return "Invoice email sent successfully to " + recipient;
    }

    public List<BillingCycle> getBillingCyclesByApartment(Long apartmentId) {
        adminResolver.requireAdmin();
        return billingCycleRepository.findByApartmentId(apartmentId);
    }

    public BillingCycle getBillingCycleDetails(Long id) {
        adminResolver.requireAdmin();
        return billingCycleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Billing cycle not found: " + id));
    }

    @Transactional
    public BillingCycle finalizeBillingCycle(Long id, InvoiceGenerationRequest request) {
        adminResolver.requireAdmin();
        BillingCycle cycle = billingCycleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Billing cycle not found: " + id));

        if (cycle.getStatus() != BillingCycle.Status.OPEN) {
            throw new IllegalStateException("Only OPEN billing cycles can have invoices generated.");
        }

        Apartment apartment = cycle.getApartment();
        TariffPlan tariff = apartment.getTariffPlan();
        if (tariff == null) {
            throw new IllegalStateException("Apartment has no active Tariff Plan. Please configure rate tiers first.");
        }

        BigDecimal baseRate = tariff.getBaseRate();
        BigDecimal baseTierLimit = tariff.getBaseTierLimit();
        BigDecimal excessRate = tariff.getExcessRate();

        List<Invoice> invoices = new ArrayList<>();
        List<Household> allHouseholds = householdRepository.findByApartmentId(apartment.getId());

        if (request != null && request.getReadings() != null && !request.getReadings().isEmpty()) {
            for (InvoiceGenerationRequest.HouseholdReading reading : request.getReadings()) {
                Household h = householdRepository.findById(reading.getHouseholdId())
                        .orElseThrow(() -> new IllegalArgumentException("Household not found: " + reading.getHouseholdId()));

                BigDecimal consumption = reading.getReadingValue() != null ? reading.getReadingValue() : BigDecimal.ZERO;

                // 1. Save or update the WaterUsageLog on cycle's endDate so it is stored in history
                Optional<WaterUsageLog> existingLogOpt = waterUsageLogRepository.findByHouseholdIdAndReadingDate(
                        h.getId(), cycle.getEndDate());
                WaterUsageLog log;
                if (existingLogOpt.isPresent()) {
                    log = existingLogOpt.get();
                    log.setReadingValue(consumption);
                } else {
                    log = new WaterUsageLog();
                    log.setHousehold(h);
                    log.setReadingDate(cycle.getEndDate());
                    log.setReadingValue(consumption);
                    log.setSource(WaterUsageLog.Source.MANUAL);
                }
                waterUsageLogRepository.save(log);

                // 2. Calculate Tiered Tariff
                BigDecimal baseCharge = BigDecimal.ZERO;
                if (consumption.compareTo(baseTierLimit) <= 0) {
                    baseCharge = consumption.multiply(baseRate).setScale(2, RoundingMode.HALF_UP);
                } else {
                    BigDecimal basePart = baseTierLimit.multiply(baseRate);
                    BigDecimal excessPart = consumption.subtract(baseTierLimit).multiply(excessRate);
                    baseCharge = basePart.add(excessPart).setScale(2, RoundingMode.HALF_UP);
                }

                // 3. Create Invoice
                Invoice invoice = new Invoice();
                invoice.setBillingCycle(cycle);
                invoice.setHousehold(h);
                invoice.setWaterUsage(consumption);
                invoice.setBaseCharge(baseCharge);
                invoice.setAdjustments(BigDecimal.ZERO);
                invoice.setTotal(baseCharge);
                invoice.setStatus(Invoice.Status.UNPAID);

                invoices.add(invoice);
            }
        } else {
            for (Household h : allHouseholds) {
                BigDecimal consumption = BigDecimal.ZERO;
                List<WaterUsageLog> logs = waterUsageLogRepository.findByHouseholdIdAndReadingDateBetween(
                        h.getId(), cycle.getStartDate(), cycle.getEndDate());
                if (!logs.isEmpty()) {
                    consumption = logs.stream().map(WaterUsageLog::getReadingValue).reduce(BigDecimal.ZERO, BigDecimal::add);
                }

                BigDecimal baseCharge = BigDecimal.ZERO;
                if (consumption.compareTo(baseTierLimit) <= 0) {
                    baseCharge = consumption.multiply(baseRate).setScale(2, RoundingMode.HALF_UP);
                } else {
                    BigDecimal basePart = baseTierLimit.multiply(baseRate);
                    BigDecimal excessPart = consumption.subtract(baseTierLimit).multiply(excessRate);
                    baseCharge = basePart.add(excessPart).setScale(2, RoundingMode.HALF_UP);
                }

                Invoice invoice = new Invoice();
                invoice.setBillingCycle(cycle);
                invoice.setHousehold(h);
                invoice.setWaterUsage(consumption);
                invoice.setBaseCharge(baseCharge);
                invoice.setAdjustments(BigDecimal.ZERO);
                invoice.setTotal(baseCharge);
                invoice.setStatus(Invoice.Status.UNPAID);

                invoices.add(invoice);
            }
        }

        cycle.getInvoices().clear();
        cycle.getInvoices().addAll(invoices);
        cycle.setStatus(BillingCycle.Status.FINALIZED);

        BillingCycle saved = billingCycleRepository.save(cycle);

        // Generate in-app alerts and mock email notifications for all households in this cycle
        for (Invoice invoice : saved.getInvoices()) {
            Alert alert = new Alert();
            alert.setHousehold(invoice.getHousehold());
            alert.setAlertType(Alert.AlertType.BILL_GENERATED);
            
            String monthName = saved.getStartDate().getMonth().name();
            int year = saved.getStartDate().getYear();
            String message = String.format("Your water bill for %s %d has been generated. Total Amount: INR %s.",
                    monthName, year, invoice.getTotal().toString());
            
            alert.setMessage(message);
            alert.setReadingDate(saved.getEndDate());
            alert.setReadingValue(invoice.getTotal());
            alert.setIsRead(false);
            alertRepository.save(alert);

            // Determine recipient email
            String recipient = null;
            if (invoice.getHousehold().getUser() != null && invoice.getHousehold().getUser().getEmail() != null && !invoice.getHousehold().getUser().getEmail().trim().isEmpty()) {
                recipient = invoice.getHousehold().getUser().getEmail();
            } else {
                recipient = invoice.getHousehold().getResidentEmail();
            }

            if (recipient != null && !recipient.trim().isEmpty() && !recipient.equals("no-resident-linked@example.com")) {
                emailService.sendInvoiceEmail(invoice, recipient);
            } else {
                logger.warn("Skipping email for household flat {}: no valid recipient email found", invoice.getHousehold().getFlatNumber());
            }
        }

        return saved;
    }

    @Transactional
    public BillingCycle archiveBillingCycle(Long id) {
        adminResolver.requireAdmin();
        BillingCycle cycle = billingCycleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Billing cycle not found: " + id));

        if (cycle.getStatus() != BillingCycle.Status.FINALIZED) {
            throw new IllegalStateException("Only FINALIZED billing cycles can be archived.");
        }

        cycle.setStatus(BillingCycle.Status.ARCHIVED);
        return billingCycleRepository.save(cycle);
    }

    @Transactional
    public Invoice updateInvoiceAdjustments(Long invoiceId, BigDecimal adjustments) {
        adminResolver.requireAdmin();
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + invoiceId));

        if (invoice.getBillingCycle().getStatus() == BillingCycle.Status.ARCHIVED) {
            throw new IllegalStateException("Cannot update adjustments on an invoice linked to an archived billing cycle.");
        }

        invoice.setAdjustments(adjustments);
        BigDecimal newTotal = invoice.getBaseCharge().add(adjustments);

        if (newTotal.compareTo(BigDecimal.ZERO) < 0) {
            newTotal = BigDecimal.ZERO;
        }
        invoice.setTotal(newTotal);

        return invoiceRepository.save(invoice);
    }

    @Transactional
    public Invoice updateInvoice(Long invoiceId, java.util.Map<String, Object> payload) {
        adminResolver.requireAdmin();
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + invoiceId));

        if (payload.containsKey("waterUsage")) {
            Object val = payload.get("waterUsage");
            if (val != null) {
                invoice.setWaterUsage(new BigDecimal(val.toString()));
            }
        }

        if (payload.containsKey("baseCharge")) {
            Object val = payload.get("baseCharge");
            if (val != null) {
                invoice.setBaseCharge(new BigDecimal(val.toString()));
            }
        }

        if (payload.containsKey("adjustments")) {
            Object val = payload.get("adjustments");
            if (val != null) {
                invoice.setAdjustments(new BigDecimal(val.toString()));
            }
        }

        if (payload.containsKey("total")) {
            Object val = payload.get("total");
            if (val != null) {
                invoice.setTotal(new BigDecimal(val.toString()));
            } else {
                invoice.setTotal(invoice.getBaseCharge().add(invoice.getAdjustments()));
            }
        } else if (payload.containsKey("baseCharge") || payload.containsKey("adjustments")) {
            invoice.setTotal(invoice.getBaseCharge().add(invoice.getAdjustments()));
        }

        if (payload.containsKey("status")) {
            String statusStr = (String) payload.get("status");
            if (statusStr != null) {
                Invoice.Status st = Invoice.Status.valueOf(statusStr.toUpperCase());
                invoice.setStatus(st);
                if (st == Invoice.Status.PAID && invoice.getPaymentDate() == null) {
                    invoice.setPaymentDate(LocalDateTime.now());
                    if (invoice.getReceiptNumber() == null) {
                        invoice.setReceiptNumber("REC-" + invoice.getId() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                    }
                } else if (st == Invoice.Status.UNPAID) {
                    invoice.setPaymentDate(null);
                }
            }
        }

        if (payload.containsKey("residentEmail")) {
            String newEmail = (String) payload.get("residentEmail");
            if (newEmail != null && !newEmail.trim().isEmpty()) {
                Household h = invoice.getHousehold();
                if (h != null) {
                    h.setResidentEmail(newEmail.trim());
                    if (h.getUser() != null) {
                        h.getUser().setEmail(newEmail.trim());
                        userRepository.save(h.getUser());
                    }
                    householdRepository.save(h);
                }
            }
        }

        return invoiceRepository.save(invoice);
    }

    @Transactional
    public BillingCycle regenerateBillingCycle(Long id) {
        adminResolver.requireAdmin();
        BillingCycle cycle = billingCycleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Billing cycle not found: " + id));

        Apartment apartment = cycle.getApartment();
        TariffPlan tariff = apartment.getTariffPlan();
        if (tariff == null) {
            throw new IllegalStateException("Apartment has no active Tariff Plan. Please configure rate tiers first.");
        }

        BigDecimal baseRate = tariff.getBaseRate();
        BigDecimal baseTierLimit = tariff.getBaseTierLimit();
        BigDecimal excessRate = tariff.getExcessRate();

        List<Household> allHouseholds = householdRepository.findByApartmentId(apartment.getId());
        List<Invoice> existingInvoices = invoiceRepository.findByBillingCycleId(cycle.getId());

        List<Invoice> refreshedInvoices = new ArrayList<>();

        for (Household h : allHouseholds) {
            Optional<Invoice> prevInvOpt = existingInvoices.stream()
                    .filter(inv -> inv.getHousehold().getId().equals(h.getId()))
                    .findFirst();

            BigDecimal consumption = BigDecimal.ZERO;
            List<WaterUsageLog> logs = waterUsageLogRepository.findByHouseholdIdAndReadingDateBetween(
                    h.getId(), cycle.getStartDate(), cycle.getEndDate());
            if (!logs.isEmpty()) {
                consumption = logs.stream().map(WaterUsageLog::getReadingValue).reduce(BigDecimal.ZERO, BigDecimal::add);
            } else if (prevInvOpt.isPresent() && prevInvOpt.get().getWaterUsage() != null && prevInvOpt.get().getWaterUsage().compareTo(BigDecimal.ZERO) > 0) {
                consumption = prevInvOpt.get().getWaterUsage();
            }

            BigDecimal baseCharge = BigDecimal.ZERO;
            if (consumption.compareTo(baseTierLimit) <= 0) {
                baseCharge = consumption.multiply(baseRate).setScale(2, RoundingMode.HALF_UP);
            } else {
                BigDecimal basePart = baseTierLimit.multiply(baseRate);
                BigDecimal excessPart = consumption.subtract(baseTierLimit).multiply(excessRate);
                baseCharge = basePart.add(excessPart).setScale(2, RoundingMode.HALF_UP);
            }

            Invoice invoice;
            if (prevInvOpt.isPresent()) {
                invoice = prevInvOpt.get();
            } else {
                invoice = new Invoice();
                invoice.setBillingCycle(cycle);
                invoice.setHousehold(h);
            }

            invoice.setWaterUsage(consumption);
            invoice.setBaseCharge(baseCharge);
            if (invoice.getAdjustments() == null) {
                invoice.setAdjustments(BigDecimal.ZERO);
            }
            invoice.setTotal(baseCharge.add(invoice.getAdjustments()));
            if (invoice.getStatus() == null) {
                invoice.setStatus(Invoice.Status.UNPAID);
            }

            refreshedInvoices.add(invoice);
        }

        invoiceRepository.saveAll(refreshedInvoices);
        cycle.getInvoices().clear();
        cycle.getInvoices().addAll(refreshedInvoices);
        cycle.setStatus(BillingCycle.Status.FINALIZED);

        return billingCycleRepository.save(cycle);
    }


    public List<Invoice> getInvoicesByCycle(Long cycleId) {
        adminResolver.requireAdmin();
        return invoiceRepository.findByBillingCycleId(cycleId);
    }

    public List<Invoice> getInvoicesByHousehold(Long householdId) {
        // Household-level queries are accessible by both admin and resident roles
        return invoiceRepository.findByHouseholdId(householdId);
    }

    public Invoice getInvoiceById(Long invoiceId) {
        return invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + invoiceId));
    }

    @Transactional
    public Invoice markInvoiceAsPaid(Long invoiceId, String paymentMethod) {
        Invoice invoice = getInvoiceById(invoiceId);

        // Duplicate-payment guard
        if (invoice.getStatus() == Invoice.Status.PAID) {
            throw new IllegalStateException("Invoice #" + invoiceId + " has already been paid. Receipt: " + invoice.getReceiptNumber());
        }

        // Generate payment metadata
        String txnId = "TXN-" + UUID.randomUUID().toString().toUpperCase().replace("-", "").substring(0, 12);
        String receiptNum = "RCP-" + String.format("%06d", invoiceId) + "-" + System.currentTimeMillis() % 100000;

        invoice.setStatus(Invoice.Status.PAID);
        invoice.setPaymentDate(LocalDateTime.now());
        invoice.setTransactionId(txnId);
        invoice.setPaymentMethod(paymentMethod != null && !paymentMethod.isBlank() ? paymentMethod : "UPI");
        invoice.setReceiptNumber(receiptNum);

        return invoiceRepository.save(invoice);
    }

    @Transactional(readOnly = true)
    public List<HouseholdUsagePreview> getUsagePreviewsForCycle(Long cycleId) {
        adminResolver.requireAdmin();
        BillingCycle cycle = billingCycleRepository.findById(cycleId)
                .orElseThrow(() -> new IllegalArgumentException("Billing cycle not found: " + cycleId));
        List<Household> households = householdRepository.findByApartmentId(cycle.getApartment().getId());
        List<HouseholdUsagePreview> previews = new ArrayList<>();

        for (Household h : households) {
            List<WaterUsageLog> logs = waterUsageLogRepository.findByHouseholdIdAndReadingDateBetween(
                    h.getId(), cycle.getStartDate(), cycle.getEndDate());
            BigDecimal totalUsage = logs.stream()
                    .map(WaterUsageLog::getReadingValue)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            previews.add(new HouseholdUsagePreview(h.getId(), h.getFlatNumber(), totalUsage));
        }
        return previews;
    }
}
