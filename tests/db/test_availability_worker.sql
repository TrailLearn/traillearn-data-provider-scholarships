BEGIN;

-- 1. Check Table Structure
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'url_checks') THEN
        RAISE EXCEPTION 'Table url_checks is missing';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scholarships' AND column_name = 'last_check_status') THEN
        RAISE EXCEPTION 'Column scholarships.last_check_status is missing';
    END IF;
END $$;

-- 2. Test Insertion
INSERT INTO scholarships (name, source_url, status)
VALUES ('Test Check', 'https://example.com/check', 'VERIFIED');

INSERT INTO url_checks (scholarship_id, status_code, latency_ms)
SELECT id, 200, 150 FROM scholarships WHERE name = 'Test Check';

-- 3. Verify Link
DO $$
DECLARE
    row_count INTEGER;
BEGIN
    SELECT count(*) INTO row_count FROM url_checks 
    WHERE scholarship_id = (SELECT id FROM scholarships WHERE name = 'Test Check');
    
    IF row_count != 1 THEN
        RAISE EXCEPTION 'URL check record not correctly linked';
    END IF;
END $$;

ROLLBACK;
