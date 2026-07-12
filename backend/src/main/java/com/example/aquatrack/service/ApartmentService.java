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
        apartment.setOwnerEmail(request.getOwnerEmail());
        apartment.setOwnerPhone(request.getOwnerPhone());
        return apartmentRepository.save(apartment);
    }

    public Apartment update(Long id, ApartmentRequest request) {
        Apartment apartment = findById(id);
        apartment.setName(request.getName());
        apartment.setAddress(request.getAddress());
        apartment.setOwnerEmail(request.getOwnerEmail());
        apartment.setOwnerPhone(request.getOwnerPhone());
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