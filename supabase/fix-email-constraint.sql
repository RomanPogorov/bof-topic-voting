-- Fix email constraint to allow NULL values
ALTER TABLE participants ALTER COLUMN email DROP NOT NULL;
