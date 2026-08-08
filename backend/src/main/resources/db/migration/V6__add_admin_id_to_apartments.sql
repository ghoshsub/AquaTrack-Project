-- Add admin_id foreign key column to apartments table
ALTER TABLE apartments ADD COLUMN admin_id BIGINT NULL;

ALTER TABLE apartments ADD CONSTRAINT fk_apartments_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL;

-- Backfill pre-existing apartments to the first existing admin (if any exist)
UPDATE apartments 
SET admin_id = (SELECT id FROM users WHERE role = 'ADMIN' ORDER BY id ASC LIMIT 1) 
WHERE admin_id IS NULL AND EXISTS (SELECT 1 FROM users WHERE role = 'ADMIN');
