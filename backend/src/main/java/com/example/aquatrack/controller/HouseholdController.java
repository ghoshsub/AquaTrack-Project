package com.example.aquatrack.controller;

import com.example.aquatrack.dto.HouseholdRequest;
import com.example.aquatrack.model.Household;
import com.example.aquatrack.service.HouseholdService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/households")
@PreAuthorize("hasRole('ADMIN')")
public class HouseholdController {

    private final HouseholdService householdService;

    public HouseholdController(HouseholdService householdService) {
        this.householdService = householdService;
    }

    @PostMapping
    public ResponseEntity<Household> create(@Valid @RequestBody HouseholdRequest request) {
        return ResponseEntity.ok(householdService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Household> update(@PathVariable Long id, @Valid @RequestBody HouseholdRequest request) {
        return ResponseEntity.ok(householdService.update(id, request));
    }

    @GetMapping("/apartment/{apartmentId}")
    public ResponseEntity<List<Household>> findByApartment(@PathVariable Long apartmentId) {
        return ResponseEntity.ok(householdService.findByApartment(apartmentId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        householdService.deleteById(id);
        return ResponseEntity.ok().build();
    }
}