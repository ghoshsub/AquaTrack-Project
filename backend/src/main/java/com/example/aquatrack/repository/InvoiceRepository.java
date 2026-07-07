package com.example.aquatrack.repository;

import com.example.aquatrack.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findByBillingCycleId(Long billingCycleId);

    List<Invoice> findByHouseholdId(Long householdId);

    Optional<Invoice> findByBillingCycleIdAndHouseholdId(Long billingCycleId, Long householdId);
}