package com.example.aquatrack.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HouseholdUsagePreview {
    private Long householdId;
    private String flatNumber;
    private BigDecimal existingUsage;
}
