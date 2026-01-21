-- Table for tracking source URL availability checks
CREATE TABLE url_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scholarship_id UUID NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
    status_code INTEGER, -- HTTP Status Code (200, 404, etc.)
    latency_ms INTEGER,  -- Response time in milliseconds
    error_message TEXT,  -- Exception message if check failed
    checked_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_url_checks_scholarship_id ON url_checks(scholarship_id);
CREATE INDEX idx_url_checks_checked_at ON url_checks(checked_at);

-- Add a column to scholarships to track the last check result for easy filtering
ALTER TABLE scholarships ADD COLUMN last_check_status INTEGER;
