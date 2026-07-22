package com.example.aquatrack.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class TariffPlanRequest {

    @NotNull
    private Long apartmentId;

    @NotNull
    @Positive
    private BigDecimal baseRate;

    @NotNull
    @Positive
    private BigDecimal baseTierLimit;

    @NotNull
    @Positive
    private BigDecimal excessRate;
}
