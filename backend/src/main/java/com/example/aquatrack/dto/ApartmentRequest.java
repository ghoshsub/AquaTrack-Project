package com.example.aquatrack.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApartmentRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String address;

    private String ownerEmail;
    private String ownerPhone;
}