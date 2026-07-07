package com.example.aquatrack.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@NoArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billing_cycle_id", nullable = false)
    @JsonIgnore
    private BillingCycle billingCycle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "household_id", nullable = false)
    @JsonIgnore
    private Household household;

    @NotNull
    @PositiveOrZero
    @Column(name = "base_charge", nullable = false, precision = 10, scale = 2)
    private BigDecimal baseCharge = BigDecimal.ZERO;

    @NotNull
    @PositiveOrZero
    @Column(name = "shared_allocation", nullable = false, precision = 10, scale = 2)
    private BigDecimal sharedAllocation = BigDecimal.ZERO;

    @Column(name = "adjustments", nullable = false, precision = 10, scale = 2)
    private BigDecimal adjustments = BigDecimal.ZERO;

    @NotNull
    @PositiveOrZero
    @Column(name = "total", nullable = false, precision = 10, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}