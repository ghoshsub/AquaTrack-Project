package com.example.aquatrack.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String displayName;
    private String role;
    
    // For residents
    private String apartmentName;
    private String flatNumber;
    private String token;
    private String passwordHint;
}
