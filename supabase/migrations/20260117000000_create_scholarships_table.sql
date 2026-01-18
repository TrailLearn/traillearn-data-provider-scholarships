-- Create Enum Type for Scholarship Status
CREATE TYPE scholarship_status AS ENUM ('DRAFT', 'SUBMITTED', 'VERIFIED', 'DEPRECATED', 'ARCHIVED');

-- Create Scholarships Table
CREATE TABLE scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    source_url TEXT NOT NULL UNIQUE,
    status scholarship_status NOT NULL DEFAULT 'SUBMITTED',
    deadline_at TIMESTAMPTZ,
    amount_min INTEGER,
    amount_max INTEGER,
    currency TEXT DEFAULT 'EUR',
    health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
    last_verified_at TIMESTAMPTZ DEFAULT now(),
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create Indexes for performance
CREATE INDEX idx_scholarships_status ON scholarships(status);
CREATE INDEX idx_scholarships_source_url ON scholarships(source_url);

-- Enable Row Level Security
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;

-- Create Policies

-- 1. Public Read Access (Everyone can read VERIFIED scholarships)
-- Note: DVP will filter by status=VERIFIED, but we allow reading all for transparency or Admin UI?
-- Let's restict public API to VERIFIED later via API logic, but DB level:
-- For now, allow public read on everything for simplicity of development, or restrict?
-- Requirement says: "Policy Public Read should allow SELECT for anon and authenticated"
CREATE POLICY "Public Read Access"
ON scholarships
FOR SELECT
TO anon, authenticated
USING (true);

-- 2. Admin Write Access
-- Assuming 'service_role' or a specific admin claim.
-- For local dev, we allow authenticated users to INSERT (for seeding/testing) but in prod this should be stricter.
-- Requirement says: "Admin Write ... users with app_metadata.role = 'admin'"
-- We'll use a placeholder check for now that allows authenticated users to write if they have the claim,
-- OR simply allow service_role. Let's stick to the requirement.

CREATE POLICY "Admin Write Access"
ON scholarships
FOR ALL
TO authenticated
USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' 
  OR 
  auth.jwt() ->> 'role' = 'service_role'
)
WITH CHECK (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  OR 
  auth.jwt() ->> 'role' = 'service_role'
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_scholarships_modtime
    BEFORE UPDATE ON scholarships
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();
