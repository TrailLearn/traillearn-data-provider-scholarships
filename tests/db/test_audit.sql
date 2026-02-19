-- Audit Log Verification
BEGIN;

-- 1. Insert a record
INSERT INTO scholarships (name, source_url, status) 
VALUES ('Audit Test', 'https://audit.test', 'DRAFT');

-- 2. Verify Audit Log exists
DO $$
DECLARE
    audit_count INT;
BEGIN
    SELECT count(*) INTO audit_count 
    FROM audit_logs 
    WHERE new_values->>'source_url' = 'https://audit.test' AND operation = 'INSERT';
    
    IF audit_count = 0 THEN
        RAISE EXCEPTION 'Audit Log INSERT missing';
    END IF;
END $$;

-- 3. Update the record
UPDATE scholarships 
SET status = 'SUBMITTED' 
WHERE source_url = 'https://audit.test';

-- 4. Verify Update Log
DO $$
DECLARE
    audit_count INT;
BEGIN
    SELECT count(*) INTO audit_count 
    FROM audit_logs 
    WHERE new_values->>'source_url' = 'https://audit.test' AND operation = 'UPDATE';
    
    IF audit_count = 0 THEN
        RAISE EXCEPTION 'Audit Log UPDATE missing';
    END IF;
END $$;

ROLLBACK;
