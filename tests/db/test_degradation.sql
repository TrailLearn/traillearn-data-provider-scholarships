BEGIN;

-- 1. Setup Data
INSERT INTO scholarships (name, source_url, status, last_verified_at, health_score, last_check_status)
VALUES ('Target Site', 'https://target.com', 'VERIFIED', now(), 100, 200);

-- 2. First Failure (Simulate Worker Action)
-- Worker inserts check result
INSERT INTO url_checks (scholarship_id, status_code, checked_at)
SELECT id, 404, now() FROM scholarships WHERE name = 'Target Site';

-- Worker updates last_check_status
UPDATE scholarships SET last_check_status = 404 WHERE name = 'Target Site';

-- Verify: Score dropped (Stability 0), Status still VERIFIED
DO $$
DECLARE 
    rec RECORD;
BEGIN
    SELECT * INTO rec FROM scholarships WHERE name='Target Site';
    
    -- Score: 40 (Fresh) + 32 (Rel) + 0 (Stab) = 72
    IF rec.health_score > 75 THEN
        RAISE EXCEPTION 'Score did not drop enough after 404. Got %', rec.health_score;
    END IF;
    
    IF rec.status != 'VERIFIED' THEN
        RAISE EXCEPTION 'Status changed too early. Got %', rec.status;
    END IF;
END $$;

-- 3. Second Consecutive Failure
INSERT INTO url_checks (scholarship_id, status_code, checked_at)
SELECT id, 404, now() + INTERVAL '1 hour' FROM scholarships WHERE name = 'Target Site';

-- Note: The trigger `on_url_check_inserted` runs HERE.
-- It checks history, finds the previous 404, and should update status.

-- Worker would also update last_check_status, but the status change might have happened already via trigger.
UPDATE scholarships SET last_check_status = 404 WHERE name = 'Target Site';

-- Verify: Status is now REVIEW_NEEDED
DO $$
DECLARE 
    rec RECORD;
BEGIN
    SELECT * INTO rec FROM scholarships WHERE name='Target Site';
    
    IF rec.status != 'REVIEW_NEEDED' THEN
        RAISE EXCEPTION 'Status failed to degrade to REVIEW_NEEDED. Got %', rec.status;
    END IF;
END $$;

ROLLBACK;
