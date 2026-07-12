package com.example.aquatrack.dto;

import com.example.aquatrack.model.WaterUsageLog;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ResidentDashboardResponse {
    private boolean isLinked;
    private String apartmentName;
    private String flatNumber;
    private List<WaterUsageLog> dailyLogs;
    private BigDecimal currentMonthUsage;
}
