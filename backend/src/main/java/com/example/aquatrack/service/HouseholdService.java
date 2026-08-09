package com.example.aquatrack.service;

import com.example.aquatrack.dto.HouseholdRequest;
import com.example.aquatrack.model.Apartment;
import com.example.aquatrack.model.Household;
import com.example.aquatrack.model.User;
import com.example.aquatrack.repository.HouseholdRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HouseholdService {

    private final HouseholdRepository householdRepository;
    private final ApartmentService apartmentService;
    private final AdminResolver adminResolver;

    public HouseholdService(HouseholdRepository householdRepository,
                            ApartmentService apartmentService,
                            AdminResolver adminResolver) {
        this.householdRepository = householdRepository;
        this.apartmentService = apartmentService;
        this.adminResolver = adminResolver;
    }

    public Household create(HouseholdRequest request) {
        adminResolver.requireAdmin();
        Apartment apartment = apartmentService.findById(request.getApartmentId());

        if (householdRepository.existsByApartmentIdAndFlatNumber(apartment.getId(), request.getFlatNumber())) {
            throw new IllegalArgumentException(
                    "Flat number " + request.getFlatNumber() + " already exists in this apartment");
        }

        Household household = new Household();
        household.setApartment(apartment);
        household.setFlatNumber(request.getFlatNumber());
        household.setFlatSize(request.getFlatSize());
        household.setOccupancy(request.getOccupancy());
        household.setResidentEmail(request.getResidentEmail());
        household.setResidentPhone(request.getResidentPhone());
        if (request.getHasWorkingMeter() != null) {
            household.setHasWorkingMeter(request.getHasWorkingMeter());
        }
        if (request.getDailyUsageThreshold() != null) {
            household.setDailyUsageThreshold(request.getDailyUsageThreshold());
        }
        return householdRepository.save(household);
    }

    public Household update(Long id, HouseholdRequest request) {
        adminResolver.requireAdmin();
        Household household = householdRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Household not found: " + id));

        // If flat number is changing, verify no conflict in the same apartment
        if (!household.getFlatNumber().equals(request.getFlatNumber())) {
            if (householdRepository.existsByApartmentIdAndFlatNumber(household.getApartment().getId(), request.getFlatNumber())) {
                throw new IllegalArgumentException(
                        "Flat number " + request.getFlatNumber() + " already exists in this apartment");
            }
        }

        household.setFlatNumber(request.getFlatNumber());
        household.setFlatSize(request.getFlatSize());
        household.setOccupancy(request.getOccupancy());
        household.setResidentEmail(request.getResidentEmail());
        household.setResidentPhone(request.getResidentPhone());
        if (request.getHasWorkingMeter() != null) {
            household.setHasWorkingMeter(request.getHasWorkingMeter());
        }
        if (request.getDailyUsageThreshold() != null) {
            household.setDailyUsageThreshold(request.getDailyUsageThreshold());
        }
        return householdRepository.save(household);
    }

    public List<Household> findByApartment(Long apartmentId) {
        adminResolver.requireAdmin();
        apartmentService.findById(apartmentId);
        return householdRepository.findByApartmentId(apartmentId);
    }

    public void deleteById(Long id) {
        adminResolver.requireAdmin();
        Household household = householdRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Household not found: " + id));
        householdRepository.deleteById(household.getId());
    }
}