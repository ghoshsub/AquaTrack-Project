package com.example.aquatrack.repository;

import com.example.aquatrack.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByHouseholdIdOrderByReadingDateDesc(Long householdId);

    @Query("SELECT a FROM Alert a WHERE a.household.apartment.id = :apartmentId ORDER BY a.readingDate DESC")
    List<Alert> findByApartmentId(@Param("apartmentId") Long apartmentId);

    @Query("SELECT a FROM Alert a WHERE a.household.apartment.admin.id = :adminId ORDER BY a.readingDate DESC")
    List<Alert> findByAdminId(@Param("adminId") Long adminId);
}
