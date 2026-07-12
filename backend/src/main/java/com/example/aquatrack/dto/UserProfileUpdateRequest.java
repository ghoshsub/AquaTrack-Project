package com.example.aquatrack.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileUpdateRequest {
    @NotBlank
    private String username;
    
    private String email;
    
    private String displayName;
    
    private String password;
}
