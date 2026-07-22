package com.example.aquatrack.controller;

import com.example.aquatrack.dto.TariffPlanRequest;
import com.example.aquatrack.model.TariffPlan;
import com.example.aquatrack.service.TariffPlanService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/tariff-plans")
@PreAuthorize("hasRole('ADMIN')")
public class TariffPlanController {

    private final TariffPlanService tariffPlanService;

    public TariffPlanController(TariffPlanService tariffPlanService) {
        this.tariffPlanService = tariffPlanService;
    }

    @PostMapping
    public ResponseEntity<TariffPlan> createOrUpdate(@Valid @RequestBody TariffPlanRequest request) {
        return ResponseEntity.ok(tariffPlanService.createOrUpdate(request));
    }

    @GetMapping("/apartment/{apartmentId}")
    public ResponseEntity<TariffPlan> getByApartment(@PathVariable Long apartmentId) {
        TariffPlan tariff = tariffPlanService.getByApartmentId(apartmentId);
        if (tariff == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(tariff);
    }
}
