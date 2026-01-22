-- Function to calculate health score based on scholarship row data
-- Returns an integer between 0 and 100
CREATE OR REPLACE FUNCTION calculate_health_score_value(s scholarships)
RETURNS INTEGER AS $$
DECLARE
    score_freshness INTEGER;
    score_reliability INTEGER;
    score_stability INTEGER;
    days_since_verified INTEGER;
    domain TEXT;
BEGIN
    -- 1. Freshness (Max 40 points)
    -- Logic: 100% at 0 days, decaying linearly to 0% at 180 days.
    IF s.last_verified_at IS NULL THEN
        score_freshness := 0;
    ELSE
        days_since_verified := EXTRACT(DAY FROM (now() - s.last_verified_at));
        
        IF days_since_verified < 0 THEN
             -- Future date? Treat as fresh (or 0 if strict, but let's say fresh)
             score_freshness := 40;
        ELSIF days_since_verified >= 180 THEN
            score_freshness := 0;
        ELSE
            -- Formula: 40 * (1 - (days / 180))
            score_freshness := FLOOR(40 * (1.0 - (days_since_verified::numeric / 180.0)));
        END IF;
    END IF;

    -- 2. Reliability (Max 40 points)
    -- Logic: Bonus for trusted domains (.edu, .gov, .ac.*, .gouv.*)
    domain := substring(s.source_url from 'https?://([^/]+)');
    
    IF domain IS NULL THEN
        score_reliability := 0; -- Invalid URL
    ELSIF domain ~* '\.(edu|gov|mil|ac\.[a-z]{2}|gouv\.[a-z]{2})(\.|$)' THEN
        score_reliability := 40;
    ELSE
        -- Standard trusted web source
        score_reliability := 32; -- 40 * 0.8
    END IF;

    -- 3. Stability (Max 20 points)
    -- Logic: Fixed for V1. Future: Check `url_checks` table for uptime.
    score_stability := 20;

    -- Total Score
    RETURN score_freshness + score_reliability + score_stability;
END;
$$ LANGUAGE plpgsql STABLE;

-- Trigger to update health_score automatically
CREATE OR REPLACE FUNCTION trigger_update_health_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculate score based on the NEW row values
    NEW.health_score := calculate_health_score_value(NEW);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_health_score
    BEFORE INSERT OR UPDATE OF last_verified_at, source_url
    ON scholarships
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_health_score();
