package com.example.aquatrack.dto;

import com.example.aquatrack.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank
    private String username;

    @Email
    private String email; // optional but validated if provided

    @NotBlank
    private String password;

    @NotNull
    private User.Role role;
}