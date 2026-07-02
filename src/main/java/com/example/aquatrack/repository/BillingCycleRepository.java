package com.example.aquatrack.repository;

import com.example.aquatrack.model.BillingCycle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BillingCycleRepository extends JpaRepository<BillingCycle, Long> {

    List<BillingCycle> findByApartmentId(Long apartmentId);

    Optional<BillingCycle> findByApartmentIdAndStatus(Long apartmentId, BillingCycle.Status status);
}