-- Create Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by UUID DEFAULT auth.uid(),
    changed_at TIMESTAMPTZ DEFAULT now()
);

-- Index for querying history
CREATE INDEX idx_audit_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_changed_at ON audit_logs(changed_at);

-- Prevent Updates and Deletes (Immutability)
-- We can do this by simply NOT granting update/delete permissions to roles,
-- OR by a trigger that raises an exception.
-- Let's use a trigger for strong enforcement.
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable';
END;
$$ language 'plpgsql';

CREATE TRIGGER prevent_audit_change
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE PROCEDURE prevent_audit_modification();

-- Enable RLS (Read only for Admins)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (
  auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' 
  OR 
  auth.jwt() ->> 'role' = 'service_role'
);

-- Main Trigger Function
CREATE OR REPLACE FUNCTION log_scholarship_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (record_id, operation, new_values, changed_by)
        VALUES (NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Only log if something changed (ignoring updated_at if that's the only change?)
        -- But for strict audit, we log everything.
        INSERT INTO audit_logs (record_id, operation, old_values, new_values, changed_by)
        VALUES (NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (record_id, operation, old_values, changed_by)
        VALUES (OLD.id, 'DELETE', to_jsonb(OLD), auth.uid());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql' SECURITY DEFINER; -- Security Definer needed to write to audit_logs even if user doesn't have explicit write permission

-- Attach Trigger to Scholarships
CREATE TRIGGER audit_scholarships_trigger
    AFTER INSERT OR UPDATE OR DELETE ON scholarships
    FOR EACH ROW
    EXECUTE PROCEDURE log_scholarship_changes();
