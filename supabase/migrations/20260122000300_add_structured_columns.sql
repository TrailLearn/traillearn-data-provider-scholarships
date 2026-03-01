-- ============================================================
-- Add structured columns to scholarships table
-- Moves frequently-queried data out of JSONB into proper columns
-- ============================================================

-- Scholarship type enum
DO $$ BEGIN
  CREATE TYPE scholarship_level AS ENUM (
    'SECONDARY',   -- lycée / bac
    'BACHELOR',    -- licence (bac+3)
    'MASTER',      -- master (bac+5)
    'PHD',         -- doctorat
    'ANY'          -- tous niveaux
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE scholarship_kind AS ENUM (
    'MERIT',       -- mérite académique
    'NEED_BASED',  -- critères sociaux / bourse sur critères sociaux
    'MOBILITY',    -- mobilité internationale
    'RESEARCH',    -- recherche / fellowship
    'DIVERSITY',   -- diversité (genre, origine)
    'OTHER'        -- autre
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add new structured columns
ALTER TABLE scholarships
  ADD COLUMN IF NOT EXISTS provider       TEXT,
  ADD COLUMN IF NOT EXISTS domain         TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS level          scholarship_level DEFAULT 'ANY',
  ADD COLUMN IF NOT EXISTS scholarship_type scholarship_kind DEFAULT 'OTHER',
  ADD COLUMN IF NOT EXISTS country        TEXT    DEFAULT 'France',
  ADD COLUMN IF NOT EXISTS tags           TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS description    TEXT;

-- Full-text search vector (French)
ALTER TABLE scholarships
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('french', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(provider, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(description, '')), 'C')
  ) STORED;

-- Indexes for new columns
CREATE INDEX IF NOT EXISTS idx_scholarships_level   ON scholarships(level);
CREATE INDEX IF NOT EXISTS idx_scholarships_type    ON scholarships(scholarship_type);
CREATE INDEX IF NOT EXISTS idx_scholarships_country ON scholarships(country);
CREATE INDEX IF NOT EXISTS idx_scholarships_domain  ON scholarships USING GIN(domain);
CREATE INDEX IF NOT EXISTS idx_scholarships_tags    ON scholarships USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_scholarships_fts     ON scholarships USING GIN(search_vector);

-- Migrate existing data: pull tags out of JSONB into the tags[] column
UPDATE scholarships
SET
  tags        = ARRAY(SELECT jsonb_array_elements_text(data->'tags'))
WHERE data ? 'tags' AND jsonb_array_length(data->'tags') > 0;

-- Migrate description from JSONB if present
UPDATE scholarships
SET description = data->>'description'
WHERE data ? 'description' AND description IS NULL;
