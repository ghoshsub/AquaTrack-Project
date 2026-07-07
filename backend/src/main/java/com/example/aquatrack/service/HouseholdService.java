package com.example.aquatrack.service;

import com.example.aquatrack.dto.HouseholdRequest;
import com.example.aquatrack.model.Apartment;
import com.example.aquatrack.model.Household;
import com.example.aquatrack.repository.HouseholdRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HouseholdService {

    private final HouseholdRepository householdRepository;
    private final ApartmentService apartmentService;

    public HouseholdService(HouseholdRepository householdRepository, ApartmentService apartmentService) {
        this.householdRepository = householdRepository;
        this.apartmentService = apartmentService;
    }

    public Household create(HouseholdRequest request) {
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
        return householdRepository.save(household);
    }

    public List<Household> findByApartment(Long apartmentId) {
        return householdRepository.findByApartmentId(apartmentId);
    }
}