-- =========================================================
-- V5__add_payment_fields_to_invoices.sql
-- Adds payment metadata columns to the invoices table to
-- support full payment workflow: transaction ID, receipt
-- number, payment method, and payment timestamp.
-- =========================================================

ALTER TABLE invoices
    ADD COLUMN payment_date      DATETIME     NULL         COMMENT 'Timestamp when payment was confirmed',
    ADD COLUMN transaction_id    VARCHAR(100) NULL         COMMENT 'Unique payment transaction identifier',
    ADD COLUMN payment_method    VARCHAR(50)  NULL         COMMENT 'Payment method used (UPI, CREDIT_CARD, NET_BANKING)',
    ADD COLUMN receipt_number    VARCHAR(100) NULL UNIQUE  COMMENT 'Unique payment receipt reference number';

-- Add status column with UNPAID default (previously added via V4, but guard with NOT EXISTS check not possible in MySQL, so this migration only adds the payment fields)
-- Status was added in an earlier migration (V4 or app bootstrap). These columns are purely additive.
