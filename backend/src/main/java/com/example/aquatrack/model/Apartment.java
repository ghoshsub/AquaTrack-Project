package com.example.aquatrack.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "apartments")
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "households"})
public class Apartment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @NotBlank
    @Column(name = "address", nullable = false, length = 255)
    private String address;

    @Column(name = "owner_email", length = 255)
    private String ownerEmail;

    @Column(name = "owner_phone", length = 50)
    private String ownerPhone;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tariff_plan_id")
    private TariffPlan tariffPlan;

    @OneToMany(mappedBy = "apartment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Household> households = new ArrayList<>();

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
