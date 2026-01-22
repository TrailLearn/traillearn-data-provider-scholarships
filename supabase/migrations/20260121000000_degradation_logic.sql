-- 1. Add REVIEW_NEEDED status
-- Note: 'ALTER TYPE ... ADD VALUE' cannot run inside a transaction block in some Postgres versions unless it's the only statement.
-- Supabase migrations run in transactions. If this fails, we might need to split it or handle it differently.
-- For now assuming Postgres 12+ which handles this better but still has constraints.
ALTER TYPE scholarship_status ADD VALUE IF NOT EXISTS 'REVIEW_NEEDED';

-- 2. Update Health Score Calculation to include Stability (Check Status)
CREATE OR REPLACE FUNCTION calculate_health_score_value(s scholarships)
RETURNS INTEGER AS $$
DECLARE
    score_freshness INTEGER;
    score_reliability INTEGER;
    score_stability INTEGER;
    days_since_verified INTEGER;
    domain TEXT;
BEGIN
    -- 1. Freshness (Max 40)
    IF s.last_verified_at IS NULL THEN
        score_freshness := 0;
    ELSE
        days_since_verified := EXTRACT(DAY FROM (now() - s.last_verified_at));
        IF days_since_verified < 0 THEN score_freshness := 40;
        ELSIF days_since_verified >= 180 THEN score_freshness := 0;
        ELSE score_freshness := FLOOR(40 * (1.0 - (days_since_verified::numeric / 180.0)));
        END IF;
    END IF;

    -- 2. Reliability (Max 40)
    domain := substring(s.source_url from 'https?://([^/]+)');
    IF domain IS NULL THEN score_reliability := 0;
    ELSIF domain ~* '\.(edu|gov|mil|ac\.[a-z]{2}|gouv\.[a-z]{2})(\.|$)' THEN score_reliability := 40;
    ELSE score_reliability := 32;
    END IF;

    -- 3. Stability (Max 20) - NEW LOGIC
    IF s.last_check_status IS NULL OR (s.last_check_status >= 200 AND s.last_check_status < 300) THEN
        score_stability := 20;
    ELSIF s.last_check_status = 404 OR s.last_check_status = 410 THEN
        score_stability := 0; -- Dead link
    ELSE
        score_stability := 10; -- Transient or other error
    END IF;

    RETURN score_freshness + score_reliability + score_stability;
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. Update Trigger to recalc score on last_check_status change
DROP TRIGGER IF EXISTS set_health_score ON scholarships;
CREATE TRIGGER set_health_score
    BEFORE INSERT OR UPDATE OF last_verified_at, source_url, last_check_status
    ON scholarships
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_health_score();

-- 4. Auto-Degradation Logic Trigger
CREATE OR REPLACE FUNCTION process_url_check_result()
RETURNS TRIGGER AS $$
DECLARE
    last_status_code INTEGER;
BEGIN
    -- Only inspect failures (current check is a failure)
    IF NEW.status_code BETWEEN 200 AND 299 THEN
        RETURN NEW;
    END IF;

    -- Get the status code of the most recent check before this one
    SELECT status_code INTO last_status_code
    FROM url_checks
    WHERE scholarship_id = NEW.scholarship_id
      AND checked_at < NEW.checked_at
    ORDER BY checked_at DESC
    LIMIT 1;

    -- If the last check was ALSO a failure (not NULL and not 2xx)
    -- This confirms 2 consecutive failures.
    IF last_status_code IS NOT NULL AND (last_status_code < 200 OR last_status_code >= 300) THEN
        UPDATE scholarships 
        SET status = 'REVIEW_NEEDED'
        WHERE id = NEW.scholarship_id 
          AND status = 'VERIFIED'; -- Only degrade Verified items
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_url_check_inserted
    AFTER INSERT ON url_checks
    FOR EACH ROW
    EXECUTE FUNCTION process_url_check_result();
