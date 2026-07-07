package com.example.aquatrack.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class UsageLogRequest {

    @NotNull
    private Long householdId;

    @NotNull
    private LocalDate readingDate;

    @NotNull
    @PositiveOrZero
    private BigDecimal readingValue;
}