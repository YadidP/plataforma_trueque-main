-- Migration: Make material_id, quantity, unit_label optional and add quantity_range
-- This migration updates the listings table to make certain fields optional
-- and adds support for quantity ranges

-- First, we'll add the new column if it doesn't exist
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS quantity_range VARCHAR(50);

-- Now make material_id, quantity, and unit_label nullable
-- Note: These statements might fail if the columns don't exist as NOT NULL yet,
-- but they are safe to run on an already-flexible schema
ALTER TABLE listings
ALTER COLUMN material_id DROP NOT NULL;

ALTER TABLE listings
ALTER COLUMN quantity DROP NOT NULL;

ALTER TABLE listings
ALTER COLUMN unit_label DROP NOT NULL;

-- Update the listings constraint to allow NULL values
-- If constraint already exists, this will error but that's okay
-- The important thing is that the columns can now be NULL
