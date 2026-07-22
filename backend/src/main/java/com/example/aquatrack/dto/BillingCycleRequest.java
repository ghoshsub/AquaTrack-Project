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

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;
}
