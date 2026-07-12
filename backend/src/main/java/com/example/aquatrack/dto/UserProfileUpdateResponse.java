package com.example.aquatrack.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileUpdateResponse {
    private String token;
    private String username;
    private String role;
    private UserProfileResponse profile;
}
