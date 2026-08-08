package com.example.aquatrack.repository;

import com.example.aquatrack.model.BillingCycle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BillingCycleRepository extends JpaRepository<BillingCycle, Long> {

    List<BillingCycle> findByApartmentId(Long apartmentId);

    List<BillingCycle> findByApartmentIdAndApartmentAdminId(Long apartmentId, Long adminId);

    Optional<BillingCycle> findByIdAndApartmentAdminId(Long id, Long adminId);

    Optional<BillingCycle> findByApartmentIdAndStatus(Long apartmentId, BillingCycle.Status status);

    @org.springframework.data.jpa.repository.Query(
        "SELECT COUNT(bc) > 0 FROM BillingCycle bc WHERE bc.apartment.id = :apartmentId " +
        "AND :startDate <= bc.endDate AND :endDate >= bc.startDate"
    )
    boolean existsOverlappingCycle(
            @org.springframework.data.repository.query.Param("apartmentId") Long apartmentId,
            @org.springframework.data.repository.query.Param("startDate") java.time.LocalDate startDate,
            @org.springframework.data.repository.query.Param("endDate") java.time.LocalDate endDate
    );
}