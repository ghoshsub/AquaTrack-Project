package com.example.aquatrack.controller;

import com.example.aquatrack.dto.ApartmentRequest;
import com.example.aquatrack.model.Apartment;
import com.example.aquatrack.service.ApartmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/apartments")
@PreAuthorize("hasRole('ADMIN')")
public class ApartmentController {

    private final ApartmentService apartmentService;

    public ApartmentController(ApartmentService apartmentService) {
        this.apartmentService = apartmentService;
    }

    @PostMapping
    public ResponseEntity<Apartment> create(@Valid @RequestBody ApartmentRequest request) {
        return ResponseEntity.ok(apartmentService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<Apartment>> findAll() {
        return ResponseEntity.ok(apartmentService.findAll());
    }
}