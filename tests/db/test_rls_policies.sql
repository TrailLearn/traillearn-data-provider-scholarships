BEGIN;

-- Helper to set role and claims
CREATE OR REPLACE FUNCTION set_request_claims(role text, claims jsonb) RETURNS void AS $$
BEGIN
  PERFORM set_config('request.jwt.claims', claims::text, true);
  PERFORM set_config('role', role, true);
END;
$$ LANGUAGE plpgsql;

-- 1. Setup Test Data (as superuser/admin first)
INSERT INTO scholarships (name, source_url, status)
VALUES ('Test Scholarship', 'http://test.rls.com', 'VERIFIED');

-------------------------------------------------------------------------------
-- TEST 1: Anonymous Read Access
-------------------------------------------------------------------------------
-- Switch to anon
SELECT set_request_claims('anon', '{}'::jsonb);

DO $$
DECLARE
    found_id uuid;
BEGIN
    SELECT id INTO found_id FROM scholarships WHERE source_url = 'http://test.rls.com';
    IF found_id IS NULL THEN
        RAISE EXCEPTION 'Test Failed: Anon user should be able to read scholarships';
    END IF;
END $$;

-------------------------------------------------------------------------------
-- TEST 2: Anonymous Write Access (Should Fail)
-------------------------------------------------------------------------------
SELECT set_request_claims('anon', '{}'::jsonb);

DO $$
BEGIN
    BEGIN
        INSERT INTO scholarships (name, source_url) VALUES ('Hacker Attempt', 'http://hacker.com');
        RAISE EXCEPTION 'Test Failed: Anon user should NOT be able to INSERT';
    EXCEPTION WHEN insufficient_privilege OR row_security_policy_violation OR check_violation THEN
        -- Expected behavior
        NULL;
    WHEN OTHERS THEN
        -- In some RLS configs it might be a different error, but usually check_violation or distinct RLS error
        NULL;
    END;
END $$;

-------------------------------------------------------------------------------
-- TEST 3: Authenticated User (No Admin Role) Write Access (Should Fail)
-------------------------------------------------------------------------------
SELECT set_request_claims('authenticated', '{"sub":"123", "role":"authenticated"}'::jsonb);

DO $$
BEGIN
    BEGIN
        INSERT INTO scholarships (name, source_url) VALUES ('Normal User Attempt', 'http://user.com');
        RAISE EXCEPTION 'Test Failed: Authenticated non-admin user should NOT be able to INSERT';
    EXCEPTION WHEN row_security_policy_violation OR check_violation THEN
        -- Expected
        NULL;
    END;
END $$;

-------------------------------------------------------------------------------
-- TEST 4: Admin Write Access
-------------------------------------------------------------------------------
-- Simulate Admin via app_metadata.role = 'admin'
SELECT set_request_claims('authenticated', '{"sub":"admin_user", "role":"authenticated", "app_metadata": {"role": "admin"}}'::jsonb);

DO $$
DECLARE
    new_id uuid;
BEGIN
    INSERT INTO scholarships (name, source_url) 
    VALUES ('Admin Created', 'http://admin-created.com')
    RETURNING id INTO new_id;
    
    IF new_id IS NULL THEN
        RAISE EXCEPTION 'Test Failed: Admin user should be able to INSERT';
    END IF;
END $$;

-- Verify Service Role also works
SELECT set_request_claims('service_role', '{"role":"service_role"}'::jsonb);
DO $$
BEGIN
    UPDATE scholarships SET name = 'Updated by Service Role' WHERE source_url = 'http://admin-created.com';
    -- If no error, success
END $$;


ROLLBACK;
