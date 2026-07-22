package com.example.aquatrack.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Getter
@Setter
@NoArgsConstructor
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "household_id", nullable = false)
    @JsonIgnore
    private Household household;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false)
    private AlertType alertType;

    @NotNull
    @Column(name = "message", nullable = false, length = 500)
    private String message;

    @NotNull
    @Column(name = "reading_date", nullable = false)
    private LocalDate readingDate;

    @NotNull
    @Column(name = "reading_value", nullable = false, precision = 10, scale = 3)
    private BigDecimal readingValue;

    @NotNull
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum AlertType {
        THRESHOLD_VIOLATION,
        LEAK_SUSPECTED,
        BILL_GENERATED
    }
}
