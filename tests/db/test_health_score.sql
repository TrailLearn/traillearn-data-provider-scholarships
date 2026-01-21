BEGIN;

-- 1. Setup Data
-- We verify that the TRIGGER works on INSERT automatically.
INSERT INTO scholarships (name, source_url, status, last_verified_at)
VALUES 
    ('Fresh Edu', 'https://test.edu/scholarship', 'VERIFIED', now()),
    ('Mid Gov', 'https://test.gov/grant', 'VERIFIED', now() - INTERVAL '90 days'),
    ('Old Com', 'https://commercial.com/promo', 'VERIFIED', now() - INTERVAL '180 days');

-- 2. Assertions

-- Case 1: Fresh Edu
-- Freshness: 40 (0 days old)
-- Reliability: 40 (.edu domain)
-- Stability: 20 (Default)
-- Total: 100
DO $$
DECLARE
    score INTEGER;
BEGIN
    SELECT health_score INTO score FROM scholarships WHERE name = 'Fresh Edu';
    IF score != 100 THEN
        RAISE EXCEPTION 'Fresh Edu score mismatch. Expected 100, got %', score;
    END IF;
END $$;

-- Case 2: Mid Gov
-- Freshness: 20 (90 days = 50% decay of 40)
-- Reliability: 40 (.gov domain)
-- Stability: 20
-- Total: 80
DO $$
DECLARE
    score INTEGER;
BEGIN
    SELECT health_score INTO score FROM scholarships WHERE name = 'Mid Gov';
    IF score != 80 THEN
        RAISE EXCEPTION 'Mid Gov score mismatch. Expected 80, got %', score;
    END IF;
END $$;

-- Case 3: Old Com
-- Freshness: 0 (180 days = 100% decay)
-- Reliability: 32 (.com = 0.8 * 40)
-- Stability: 20
-- Total: 52
DO $$
DECLARE
    score INTEGER;
BEGIN
    SELECT health_score INTO score FROM scholarships WHERE name = 'Old Com';
    IF score != 52 THEN
        RAISE EXCEPTION 'Old Com score mismatch. Expected 52, got %', score;
    END IF;
END $$;

-- 4. Test Recalculation Function
-- Simulate time passing for Fresh Edu (update last_verified_at)
UPDATE scholarships SET last_verified_at = now() - INTERVAL '45 days' WHERE name = 'Fresh Edu';

-- Expected: 
-- Freshness: 40 * (1 - 45/180) = 40 * 0.75 = 30
-- Reliability: 40
-- Stability: 20
-- Total: 90
DO $$
DECLARE
    score INTEGER;
BEGIN
    SELECT health_score INTO score FROM scholarships WHERE name = 'Fresh Edu';
    IF score != 90 THEN
        RAISE EXCEPTION 'Update Recalc Failed. Expected 90, got %', score;
    END IF;
END $$;

ROLLBACK;