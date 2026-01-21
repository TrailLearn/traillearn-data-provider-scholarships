-- Function to batch recalculate scores (for daily decay)
CREATE OR REPLACE FUNCTION recalc_all_scores()
RETURNS void AS $$
BEGIN
    -- Update health_score for all active scholarships using the calculation logic
    -- We bypass the trigger for efficiency by calling the function directly in the UPDATE
    UPDATE scholarships
    SET health_score = calculate_health_score_value(scholarships)
    WHERE status NOT IN ('ARCHIVED', 'DEPRECATED');
END;
$$ LANGUAGE plpgsql;

-- Schedule the job (Requires pg_cron extension)
-- Note: This might fail in some local environments if pg_cron is not enabled in postgresql.conf
-- We wrap it in a DO block to warn but not fail hard if extension missing.

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.schedule(
            'nightly-score-update',
            '0 3 * * *', -- 3:00 AM daily
            'SELECT recalc_all_scores()'
        );
    ELSE
        RAISE NOTICE 'pg_cron extension not found. Skipping schedule creation. Please enable pg_cron manually.';
    END IF;
END $$;
