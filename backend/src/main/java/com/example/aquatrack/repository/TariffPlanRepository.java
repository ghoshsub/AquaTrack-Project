package com.example.aquatrack.repository;

import com.example.aquatrack.model.TariffPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import java.util.Optional;

public interface TariffPlanRepository extends JpaRepository<TariffPlan, Long> {

    List<TariffPlan> findByApartmentId(Long apartmentId);

    Optional<TariffPlan> findByApartmentIdAndApartmentAdminId(Long apartmentId, Long adminId);
}