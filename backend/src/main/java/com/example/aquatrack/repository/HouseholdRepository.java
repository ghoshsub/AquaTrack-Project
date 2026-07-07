package com.example.aquatrack.repository;

import com.example.aquatrack.model.Household;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HouseholdRepository extends JpaRepository<Household, Long> {

    List<Household> findByApartmentId(Long apartmentId);

    boolean existsByApartmentIdAndFlatNumber(Long apartmentId, String flatNumber);
}