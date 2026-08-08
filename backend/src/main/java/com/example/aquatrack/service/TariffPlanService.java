package com.example.aquatrack.service;

import com.example.aquatrack.dto.TariffPlanRequest;
import com.example.aquatrack.model.Apartment;
import com.example.aquatrack.model.TariffPlan;
import com.example.aquatrack.model.User;
import com.example.aquatrack.repository.ApartmentRepository;
import com.example.aquatrack.repository.TariffPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TariffPlanService {

    private final TariffPlanRepository tariffPlanRepository;
    private final ApartmentRepository apartmentRepository;
    private final AdminResolver adminResolver;

    public TariffPlanService(TariffPlanRepository tariffPlanRepository,
                             ApartmentRepository apartmentRepository,
                             AdminResolver adminResolver) {
        this.tariffPlanRepository = tariffPlanRepository;
        this.apartmentRepository = apartmentRepository;
        this.adminResolver = adminResolver;
    }

    @Transactional
    public TariffPlan createOrUpdate(TariffPlanRequest request) {
        adminResolver.requireAdmin();
        Apartment apartment = apartmentRepository.findById(request.getApartmentId())
                .orElseThrow(() -> new IllegalArgumentException("Apartment not found: " + request.getApartmentId()));

        TariffPlan tariff;
        if (apartment.getTariffPlan() != null) {
            tariff = apartment.getTariffPlan();
        } else {
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
        adminResolver.requireAdmin();
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new IllegalArgumentException("Apartment not found: " + apartmentId));
        return apartment.getTariffPlan();
    }

    public List<TariffPlan> findByApartmentId(Long apartmentId) {
        adminResolver.requireAdmin();
        return tariffPlanRepository.findByApartmentId(apartmentId);
    }
}
