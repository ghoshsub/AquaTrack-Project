package com.example.aquatrack.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ApartmentRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String address;

    @Email(message = "Owner email must be a valid email address.")
    private String ownerEmail;

    @Pattern(
        regexp = "^$|^[0-9]{10}$",
        message = "Phone number must be exactly 10 digits."
    )
    private String ownerPhone;

    // Tariff plan fields — required when creating, optional when updating
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