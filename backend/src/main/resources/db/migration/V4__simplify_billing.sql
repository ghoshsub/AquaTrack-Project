DROP TABLE IF EXISTS water_procurements;

ALTER TABLE invoices 
    DROP COLUMN shared_allocation,
    ADD COLUMN status ENUM('PAID', 'UNPAID') NOT NULL DEFAULT 'UNPAID';
