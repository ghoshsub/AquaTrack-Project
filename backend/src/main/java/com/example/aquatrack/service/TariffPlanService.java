package com.example.aquatrack.service;

import com.example.aquatrack.dto.TariffPlanRequest;
import com.example.aquatrack.model.Apartment;
import com.example.aquatrack.model.TariffPlan;
import com.example.aquatrack.repository.ApartmentRepository;
import com.example.aquatrack.repository.TariffPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TariffPlanService {

    private final TariffPlanRepository tariffPlanRepository;
    private final ApartmentRepository apartmentRepository;

    public TariffPlanService(TariffPlanRepository tariffPlanRepository,
                             ApartmentRepository apartmentRepository) {
        this.tariffPlanRepository = tariffPlanRepository;
        this.apartmentRepository = apartmentRepository;
    }

    @Transactional
    public TariffPlan createOrUpdate(TariffPlanRequest request) {
        Apartment apartment = apartmentRepository.findById(request.getApartmentId())
                .orElseThrow(() -> new IllegalArgumentException("Apartment not found: " + request.getApartmentId()));

        TariffPlan tariff;
        if (apartment.getTariffPlan() != null) {
            // Update existing tariff plan
            tariff = apartment.getTariffPlan();
        } else {
            // Create new tariff plan
            tariff = new TariffPlan();
            tariff.setApartment(apartment);
        }

        tariff.setBaseRate(request.getBaseRate());
        tariff.setBaseTierLimit(request.getBaseTierLimit());
        tariff.setExcessRate(request.getExcessRate());

        tariff = tariffPlanRepository.save(tariff);

        // Link the tariff plan to the apartment
        apartment.setTariffPlan(tariff);
        apartmentRepository.save(apartment);

        return tariff;
    }

    public TariffPlan getByApartmentId(Long apartmentId) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new IllegalArgumentException("Apartment not found: " + apartmentId));
        return apartment.getTariffPlan();
    }

    public List<TariffPlan> findByApartmentId(Long apartmentId) {
        return tariffPlanRepository.findByApartmentId(apartmentId);
    }
}
