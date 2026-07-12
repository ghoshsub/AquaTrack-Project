-- Add owner email and phone to apartments
ALTER TABLE apartments
ADD COLUMN owner_email VARCHAR(255),
ADD COLUMN owner_phone VARCHAR(50);

-- Add resident email to households
ALTER TABLE households
ADD COLUMN resident_email VARCHAR(255);
