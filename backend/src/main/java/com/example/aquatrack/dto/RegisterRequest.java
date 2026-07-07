package com.example.aquatrack.dto;

import com.example.aquatrack.model.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank
    private String username;

    @NotBlank
    private String password;

    @NotNull
    private User.Role role;

    private Long householdId; // optional — only used when role = RESIDENT
}