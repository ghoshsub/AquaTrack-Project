package com.example.aquatrack.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tariff_plans")
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TariffPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false)
    @JsonIgnore
    private Apartment apartment;

    @NotNull
    @Positive
    @Column(name = "base_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal baseRate;

    @NotNull
    @Positive
    @Column(name = "base_tier_limit", nullable = false, precision = 10, scale = 2)
    private BigDecimal baseTierLimit;

    @NotNull
    @Positive
    @Column(name = "excess_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal excessRate;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}