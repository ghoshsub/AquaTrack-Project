-- =========================================================
-- V1__init_schema.sql
-- AquaTrack core schema: apartments, households, users,
-- water usage logs, tariff plans, billing cycles, invoices
-- =========================================================

CREATE TABLE apartments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE tariff_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    apartment_id BIGINT NOT NULL,
    base_rate DECIMAL(10,2) NOT NULL,
    base_tier_limit DECIMAL(10,2) NOT NULL,
    excess_rate DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tariff_apartment FOREIGN KEY (apartment_id)
        REFERENCES apartments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Now that tariff_plans exists, link apartments -> tariff_plan_id
ALTER TABLE apartments
    ADD COLUMN tariff_plan_id BIGINT NULL,
    ADD CONSTRAINT fk_apartment_tariff FOREIGN KEY (tariff_plan_id)
        REFERENCES tariff_plans(id) ON DELETE SET NULL;

CREATE TABLE households (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    apartment_id BIGINT NOT NULL,
    flat_number VARCHAR(20) NOT NULL,
    flat_size DECIMAL(10,2) NOT NULL,
    occupancy INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_household_apartment FOREIGN KEY (apartment_id)
        REFERENCES apartments(id) ON DELETE CASCADE,
    CONSTRAINT uq_apartment_flat UNIQUE (apartment_id, flat_number)
) ENGINE=InnoDB;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    household_id BIGINT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'RESIDENT') NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_household FOREIGN KEY (household_id)
        REFERENCES households(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE water_usage_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    household_id BIGINT NOT NULL,
    reading_date DATE NOT NULL,
    reading_value DECIMAL(10,3) NOT NULL,
    source ENUM('MANUAL', 'BULK_CSV') NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usage_household FOREIGN KEY (household_id)
        REFERENCES households(id) ON DELETE CASCADE,
    CONSTRAINT uq_household_reading_date UNIQUE (household_id, reading_date)
) ENGINE=InnoDB;

CREATE TABLE billing_cycles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    apartment_id BIGINT NOT NULL,
    status ENUM('OPEN', 'FINALIZED', 'ARCHIVED') NOT NULL DEFAULT 'OPEN',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_purchased_volume DECIMAL(12,3) NOT NULL DEFAULT 0,
    unit_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cycle_apartment FOREIGN KEY (apartment_id)
        REFERENCES apartments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    billing_cycle_id BIGINT NOT NULL,
    household_id BIGINT NOT NULL,
    base_charge DECIMAL(10,2) NOT NULL DEFAULT 0,
    shared_allocation DECIMAL(10,2) NOT NULL DEFAULT 0,
    adjustments DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoice_cycle FOREIGN KEY (billing_cycle_id)
        REFERENCES billing_cycles(id) ON DELETE CASCADE,
    CONSTRAINT fk_invoice_household FOREIGN KEY (household_id)
        REFERENCES households(id) ON DELETE CASCADE,
    CONSTRAINT uq_cycle_household UNIQUE (billing_cycle_id, household_id)
) ENGINE=InnoDB;