package com.example.aquatrack.model;

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
public class Household {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false)
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

    @OneToMany(mappedBy = "household", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WaterUsageLog> usageLogs = new ArrayList<>();

    @OneToOne(mappedBy = "household", cascade = CascadeType.ALL)
    private User user;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}