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
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billing_cycle_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"invoices", "apartment"})
    private BillingCycle billingCycle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "household_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"usageLogs", "user", "apartment"})
    private Household household;

    @NotNull
    @PositiveOrZero
    @Column(name = "water_usage", nullable = false, precision = 12, scale = 3)
    private BigDecimal waterUsage = BigDecimal.ZERO;

    @NotNull
    @PositiveOrZero
    @Column(name = "base_charge", nullable = false, precision = 10, scale = 2)
    private BigDecimal baseCharge = BigDecimal.ZERO;

    @Column(name = "adjustments", nullable = false, precision = 10, scale = 2)
    private BigDecimal adjustments = BigDecimal.ZERO;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.UNPAID;

    public enum Status {
        PAID,
        UNPAID
    }

    @NotNull
    @PositiveOrZero
    @Column(name = "total", nullable = false, precision = 10, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // ── Payment metadata ──────────────────────────────────────────────────────
    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "receipt_number", length = 100, unique = true)
    private String receiptNumber;
}