-- Enable pg_net for HTTP requests if not present
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to trigger the Edge Function via HTTP
CREATE OR REPLACE FUNCTION trigger_check_availability()
RETURNS void AS $$
BEGIN
  -- We use the internal docker network URL if local, or project URL if remote.
  -- For local dev with Supabase CLI: http://host.docker.internal:54321/functions/v1/check-availability
  -- In production, the URL and service_key are usually configured via environment variables.
  
  PERFORM net.http_post(
    url := 'http://supabase_functions_traillearn:9000/check-availability', -- Placeholder internal URL
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
END;
$$ LANGUAGE plpgsql;

-- Schedule via pg_cron
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.schedule(
            'nightly-availability-check',
            '0 2 * * *', -- 2:00 AM daily
            'SELECT trigger_check_availability()'
        );
    END IF;
END $$;
