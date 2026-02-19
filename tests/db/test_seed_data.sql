BEGIN;

-- 1. Check Total Quantity
DO $$
DECLARE
    cnt INTEGER;
BEGIN
    -- We expect exactly 5 from seed, but if other tests ran it might be more.
    -- Assuming fresh db or at least seed present.
    SELECT count(*) INTO cnt FROM scholarships WHERE source_url IN (
        'https://education.gov.us/scholarships/merit-2026',
        'https://campusfrance.org/mobility-grant',
        'https://womenintech.foundation/grants',
        'https://research-council.eu/fellowship',
        'https://arts-foundation.org/apply'
    );
    
    IF cnt != 5 THEN
        RAISE EXCEPTION 'Seed verification failed: Expected 5 specific seed records, found %', cnt;
    END IF;
END $$;

-- 2. Check Verification Status & Diversity
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM scholarships 
        WHERE source_url IN (
            'https://education.gov.us/scholarships/merit-2026',
            'https://campusfrance.org/mobility-grant'
        )
        AND status != 'VERIFIED'
    ) THEN
        RAISE EXCEPTION 'Seed verification failed: Seed data should be VERIFIED';
    END IF;
END $$;

-- 3. Check JSONB Complexity (Deep Inspection)
DO $$
DECLARE
    merit_data JSONB;
    arts_data JSONB;
BEGIN
    -- Check Merit data
    SELECT data INTO merit_data FROM scholarships WHERE source_url = 'https://education.gov.us/scholarships/merit-2026';
    
    IF (merit_data->'eligibility'->>'gpa_min')::numeric != 3.8 THEN
        RAISE EXCEPTION 'JSONB check failed: Merit GPA incorrect';
    END IF;

    -- Check Arts data
    SELECT data INTO arts_data FROM scholarships WHERE source_url = 'https://arts-foundation.org/apply';
    
    IF (arts_data->'eligibility'->>'portfolio_required')::boolean IS NOT TRUE THEN
        RAISE EXCEPTION 'JSONB check failed: Arts portfolio requirement missing';
    END IF;
END $$;

ROLLBACK;
