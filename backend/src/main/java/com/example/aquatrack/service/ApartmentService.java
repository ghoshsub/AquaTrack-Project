package com.example.aquatrack.service;

import com.example.aquatrack.dto.ApartmentRequest;
import com.example.aquatrack.model.Apartment;
import com.example.aquatrack.repository.ApartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApartmentService {

    private final ApartmentRepository apartmentRepository;

    public ApartmentService(ApartmentRepository apartmentRepository) {
        this.apartmentRepository = apartmentRepository;
    }

    public Apartment create(ApartmentRequest request) {
        Apartment apartment = new Apartment();
        apartment.setName(request.getName());
        apartment.setAddress(request.getAddress());
        return apartmentRepository.save(apartment);
    }

    public List<Apartment> findAll() {
        return apartmentRepository.findAll();
    }

    public Apartment findById(Long id) {
        return apartmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Apartment not found: " + id));
    }
}