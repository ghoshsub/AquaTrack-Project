package com.example.aquatrack.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class BillingCycleRequest {

    @NotNull
    private Long apartmentId;

    private LocalDate startDate;

    private LocalDate endDate;

    private String month; // e.g. "2026-09"
}
