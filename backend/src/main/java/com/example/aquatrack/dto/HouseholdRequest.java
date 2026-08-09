package com.example.aquatrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class HouseholdRequest {

    @NotNull
    private Long apartmentId;

    @NotBlank
    private String flatNumber;

    @NotNull
    @Positive
    private BigDecimal flatSize;

    @NotNull
    @Positive
    private Integer occupancy;

    @jakarta.validation.constraints.Email(message = "Resident email must be a valid email address.")
    private String residentEmail;

    @jakarta.validation.constraints.Pattern(
        regexp = "^$|^[0-9]{10}$",
        message = "Phone number must be exactly 10 digits."
    )
    private String residentPhone;

    private Boolean hasWorkingMeter = true;

    @Positive
    private BigDecimal dailyUsageThreshold = new BigDecimal("500.00");
}