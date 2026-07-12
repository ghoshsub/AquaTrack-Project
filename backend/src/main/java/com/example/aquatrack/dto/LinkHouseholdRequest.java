package com.example.aquatrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LinkHouseholdRequest {

    @NotNull
    private Long apartmentId;

    @NotBlank
    private String flatNumber;
}
