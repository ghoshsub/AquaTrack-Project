package com.example.aquatrack.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "households")
@Getter
@Setter
@NoArgsConstructor
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Household {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false)
    @JsonIgnore
    private Apartment apartment;

    @NotBlank
    @Column(name = "flat_number", nullable = false, length = 20)
    private String flatNumber;

    @NotNull
    @Positive
    @Column(name = "flat_size", nullable = false, precision = 10, scale = 2)
    private BigDecimal flatSize;

    @NotNull
    @Positive
    @Column(name = "occupancy", nullable = false)
    private Integer occupancy = 1;

    @Column(name = "resident_email", length = 255)
    private String residentEmail;

    @NotNull
    @Column(name = "has_working_meter", nullable = false)
    private Boolean hasWorkingMeter = true;

    @NotNull
    @Positive
    @Column(name = "daily_usage_threshold", nullable = false, precision = 10, scale = 2)
    private BigDecimal dailyUsageThreshold = new BigDecimal("500.00");

    @OneToMany(mappedBy = "household", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<WaterUsageLog> usageLogs = new ArrayList<>();

    @OneToOne(mappedBy = "household", cascade = CascadeType.ALL)
    private User user;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}