-- Add password_hint column to users table so demo credentials and admin edits reflect dynamically
ALTER TABLE users ADD COLUMN password_hint VARCHAR(255) NULL;

-- Backfill default credentials for existing seed rows
UPDATE users SET password_hint = 'admin123' WHERE role = 'ADMIN' AND (password_hint IS NULL OR password_hint = '');
UPDATE users SET password_hint = 'resident123' WHERE role = 'RESIDENT' AND (password_hint IS NULL OR password_hint = '');
