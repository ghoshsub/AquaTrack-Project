package com.example.aquatrack.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "water_usage_logs")
@Getter
@Setter
@NoArgsConstructor
public class WaterUsageLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "household_id", nullable = false)
    private Household household;

    @NotNull
    @Column(name = "reading_date", nullable = false)
    private LocalDate readingDate;

    @NotNull
    @PositiveOrZero
    @Column(name = "reading_value", nullable = false, precision = 10, scale = 3)
    private BigDecimal readingValue;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false)
    private Source source;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum Source {
        MANUAL,
        BULK_CSV
    }
}