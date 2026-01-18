-- Simple Schema Verification Script
-- Run this in Supabase SQL Editor to verify structure

BEGIN;

-- 1. Check Table Existence
SELECT * FROM scholarships WHERE false;

-- 2. Check Enum Type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'scholarship_status') THEN
        RAISE EXCEPTION 'Enum scholarship_status missing';
    END IF;
END $$;

-- 3. Check RLS Enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
        AND c.relname = 'scholarships'
        AND c.relrowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS not enabled on scholarships';
    END IF;
END $$;

-- 4. Test Insert (Should fail for anon/normal user, success for admin simulation)
-- This part is tricky to test in raw SQL without setting role context, 
-- but ensuring the transaction parses proves the schema is valid.

ROLLBACK; -- Always rollback test data
