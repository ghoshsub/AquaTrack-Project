package com.example.aquatrack.dto;

import java.math.BigDecimal;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InvoiceGenerationRequest {
    private List<HouseholdReading> readings;

    @Getter
    @Setter
    public static class HouseholdReading {
        private Long householdId;
        private BigDecimal readingValue;
    }
}
