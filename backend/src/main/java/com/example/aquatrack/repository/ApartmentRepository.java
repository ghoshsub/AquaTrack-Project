package com.example.aquatrack.repository;

import com.example.aquatrack.model.Apartment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ApartmentRepository extends JpaRepository<Apartment, Long> {

    List<Apartment> findByAdminId(Long adminId);

    Optional<Apartment> findByIdAndAdminId(Long id, Long adminId);

    boolean existsByIdAndAdminId(Long id, Long adminId);
}