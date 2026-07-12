package com.example.aquatrack.repository;

import com.example.aquatrack.model.Household;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HouseholdRepository extends JpaRepository<Household, Long> {

    List<Household> findByApartmentId(Long apartmentId);

    boolean existsByApartmentIdAndFlatNumber(Long apartmentId, String flatNumber);

    Optional<Household> findByApartmentIdAndFlatNumber(Long apartmentId, String flatNumber);
}