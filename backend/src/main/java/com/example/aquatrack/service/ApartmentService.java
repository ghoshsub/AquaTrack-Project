package com.example.aquatrack.service;

import com.example.aquatrack.dto.ApartmentRequest;
import com.example.aquatrack.model.Apartment;
import com.example.aquatrack.model.TariffPlan;
import com.example.aquatrack.repository.ApartmentRepository;
import com.example.aquatrack.repository.TariffPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ApartmentService {

    private final ApartmentRepository apartmentRepository;
    private final TariffPlanRepository tariffPlanRepository;

    public ApartmentService(ApartmentRepository apartmentRepository,
                            TariffPlanRepository tariffPlanRepository) {
        this.apartmentRepository = apartmentRepository;
        this.tariffPlanRepository = tariffPlanRepository;
    }

    @Transactional
    public Apartment create(ApartmentRequest request) {
        Apartment apartment = new Apartment();
        apartment.setName(request.getName());
        apartment.setAddress(request.getAddress());
        apartment.setOwnerEmail(request.getOwnerEmail());
        apartment.setOwnerPhone(request.getOwnerPhone());

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

    public List<Apartment> findAll() {
        return apartmentRepository.findAll();
    }

    public Apartment findById(Long id) {
        return apartmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Apartment not found: " + id));
    }

    public void deleteById(Long id) {
        if (!apartmentRepository.existsById(id)) {
            throw new IllegalArgumentException("Apartment not found: " + id);
        }
        apartmentRepository.deleteById(id);
    }
}