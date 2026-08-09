package com.example.aquatrack.service;

import com.example.aquatrack.dto.ApartmentRequest;
import com.example.aquatrack.model.Apartment;
import com.example.aquatrack.model.TariffPlan;
import com.example.aquatrack.model.User;
import com.example.aquatrack.repository.ApartmentRepository;
import com.example.aquatrack.repository.BillingCycleRepository;
import com.example.aquatrack.repository.TariffPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ApartmentService {

    private final ApartmentRepository apartmentRepository;
    private final TariffPlanRepository tariffPlanRepository;
    private final BillingCycleRepository billingCycleRepository;
    private final AdminResolver adminResolver;

    public ApartmentService(ApartmentRepository apartmentRepository,
                            TariffPlanRepository tariffPlanRepository,
                            BillingCycleRepository billingCycleRepository,
                            AdminResolver adminResolver) {
        this.apartmentRepository = apartmentRepository;
        this.tariffPlanRepository = tariffPlanRepository;
        this.billingCycleRepository = billingCycleRepository;
        this.adminResolver = adminResolver;
    }

    @Transactional
    public Apartment create(ApartmentRequest request) {
        User admin = adminResolver.requireAdmin();

        Apartment apartment = new Apartment();
        apartment.setName(request.getName());
        apartment.setAddress(request.getAddress());
        apartment.setOwnerEmail(request.getOwnerEmail());
        apartment.setOwnerPhone(request.getOwnerPhone());
        apartment.setAdmin(admin);

        // Save apartment first to get an ID
        apartment = apartmentRepository.save(apartment);

        // Create and link tariff plan
        TariffPlan tariff = new TariffPlan();
        tariff.setApartment(apartment);
        tariff.setBaseRate(request.getBaseRate());
        tariff.setBaseTierLimit(request.getBaseTierLimit());
        tariff.setExcessRate(request.getExcessRate());
        tariff = tariffPlanRepository.save(tariff);

        apartment.setTariffPlan(tariff);
        return apartmentRepository.save(apartment);
    }

    @Transactional
    public Apartment update(Long id, ApartmentRequest request) {
        adminResolver.requireAdmin();
        Apartment apartment = findById(id);

        apartment.setName(request.getName());
        apartment.setAddress(request.getAddress());
        apartment.setOwnerEmail(request.getOwnerEmail());
        apartment.setOwnerPhone(request.getOwnerPhone());

        // Update or create tariff plan
        TariffPlan tariff = apartment.getTariffPlan();
        if (tariff == null) {
            tariff = new TariffPlan();
            tariff.setApartment(apartment);
        }
        tariff.setBaseRate(request.getBaseRate());
        tariff.setBaseTierLimit(request.getBaseTierLimit());
        tariff.setExcessRate(request.getExcessRate());
        tariff = tariffPlanRepository.save(tariff);

        apartment.setTariffPlan(tariff);
        return apartmentRepository.save(apartment);
    }

    /**
     * Returns all apartments in the database (shared across all admins).
     */
    public List<Apartment> findAll() {
        adminResolver.requireAdmin();
        return apartmentRepository.findAll();
    }

    /**
     * Returns all apartments regardless of admin — used internally (e.g. for resident lookup).
     */
    public List<Apartment> findAllForResidents() {
        return apartmentRepository.findAll();
    }

    public Apartment findById(Long id) {
        return apartmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Apartment not found: " + id));
    }

    /**
     * Finds apartment by id (shared access across admins).
     */
    public Apartment findByIdForAdmin(Long id, Long adminId) {
        return findById(id);
    }

    @Transactional
    public void deleteById(Long id) {
        adminResolver.requireAdmin();
        Apartment apartment = apartmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Apartment not found: " + id));

        // 1. Delete billing cycles (invoices are cascade-deleted via BillingCycle.invoices)
        billingCycleRepository.deleteByApartmentId(id);

        // 2. Clear the tariff_plan_id FK on the apartment so TariffPlan can be deleted
        TariffPlan tariff = apartment.getTariffPlan();
        apartment.setTariffPlan(null);
        apartmentRepository.save(apartment);

        // 3. Delete the tariff plan
        if (tariff != null) {
            tariffPlanRepository.delete(tariff);
        }

        // 4. Finally delete the apartment (households cascade via Apartment.households)
        apartmentRepository.deleteById(id);
    }
}