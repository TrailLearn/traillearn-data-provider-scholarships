-- ============================================================
-- TrailLearn Bourses — Bootstrap complet
-- Copier-coller en entier dans le SQL Editor Supabase
-- https://supabase.com/dashboard/project/pzenoypbqzvirjtpenwz/sql/new
-- ============================================================

-- ============================================================
-- ÉTAPE 1 : Enums
-- ============================================================

DO $$ BEGIN
  CREATE TYPE scholarship_status AS ENUM (
    'DRAFT', 'SUBMITTED', 'VERIFIED', 'DEPRECATED', 'ARCHIVED', 'REVIEW_NEEDED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE scholarship_level AS ENUM (
    'SECONDARY', 'BACHELOR', 'MASTER', 'PHD', 'ANY'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE scholarship_kind AS ENUM (
    'MERIT', 'NEED_BASED', 'MOBILITY', 'RESEARCH', 'DIVERSITY', 'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- ÉTAPE 2 : Table scholarships
-- ============================================================

CREATE TABLE IF NOT EXISTS scholarships (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT NOT NULL,
    source_url          TEXT NOT NULL UNIQUE,
    status              scholarship_status NOT NULL DEFAULT 'SUBMITTED',
    provider            TEXT,
    scholarship_type    scholarship_kind DEFAULT 'OTHER',
    level               scholarship_level DEFAULT 'ANY',
    domain              TEXT[] DEFAULT '{}',
    country             TEXT DEFAULT 'France',
    tags                TEXT[] DEFAULT '{}',
    description         TEXT,
    deadline_at         TIMESTAMPTZ,
    amount_min          INTEGER,
    amount_max          INTEGER,
    currency            TEXT DEFAULT 'EUR',
    health_score        INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
    last_verified_at    TIMESTAMPTZ DEFAULT now(),
    last_check_status   INTEGER,
    last_content_hash   TEXT,
    last_content_length INTEGER,
    data                JSONB DEFAULT '{}'::jsonb,
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

-- Colonne FTS générée (après la table pour éviter les dépendances circulaires)
ALTER TABLE scholarships
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('french', COALESCE(name, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(provider, '')), 'B') ||
    setweight(to_tsvector('french', COALESCE(description, '')), 'C')
  ) STORED;

-- Index
CREATE INDEX IF NOT EXISTS idx_scholarships_status     ON scholarships(status);
CREATE INDEX IF NOT EXISTS idx_scholarships_source_url ON scholarships(source_url);
CREATE INDEX IF NOT EXISTS idx_scholarships_level      ON scholarships(level);
CREATE INDEX IF NOT EXISTS idx_scholarships_type       ON scholarships(scholarship_type);
CREATE INDEX IF NOT EXISTS idx_scholarships_country    ON scholarships(country);
CREATE INDEX IF NOT EXISTS idx_scholarships_domain     ON scholarships USING GIN(domain);
CREATE INDEX IF NOT EXISTS idx_scholarships_tags       ON scholarships USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_scholarships_fts        ON scholarships USING GIN(search_vector);

-- RLS
ALTER TABLE scholarships ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public Read Access"
    ON scholarships FOR SELECT TO anon, authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Admin Write Access"
    ON scholarships FOR ALL TO authenticated
    USING (
      auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
      OR auth.jwt() ->> 'role' = 'service_role'
    )
    WITH CHECK (
      auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
      OR auth.jwt() ->> 'role' = 'service_role'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_scholarships_modtime ON scholarships;
CREATE TRIGGER update_scholarships_modtime
    BEFORE UPDATE ON scholarships
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

-- ============================================================
-- ÉTAPE 3 : audit_logs
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id   UUID NOT NULL,
    operation   TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values  JSONB,
    new_values  JSONB,
    changed_by  UUID DEFAULT auth.uid(),
    changed_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_record_id ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_changed_at ON audit_logs(changed_at);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admins can read audit logs"
    ON audit_logs FOR SELECT TO authenticated
    USING (
      auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
      OR auth.jwt() ->> 'role' = 'service_role'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_audit_change ON audit_logs;
CREATE TRIGGER prevent_audit_change
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE PROCEDURE prevent_audit_modification();

CREATE OR REPLACE FUNCTION log_scholarship_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (record_id, operation, new_values, changed_by)
        VALUES (NEW.id, 'INSERT', to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_scholarships_trigger ON scholarships;
CREATE TRIGGER audit_scholarships_trigger
    AFTER INSERT OR UPDATE OR DELETE ON scholarships
    FOR EACH ROW
    EXECUTE PROCEDURE log_scholarship_changes();

-- ============================================================
-- ÉTAPE 4 : Health Score
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_health_score_value(s scholarships)
RETURNS INTEGER AS $$
DECLARE
    score_freshness    INTEGER;
    score_reliability  INTEGER;
    score_stability    INTEGER;
    days_since_verified INTEGER;
    domain TEXT;
BEGIN
    -- Fraîcheur (max 40)
    IF s.last_verified_at IS NULL THEN
        score_freshness := 0;
    ELSE
        days_since_verified := EXTRACT(DAY FROM (now() - s.last_verified_at));
        IF days_since_verified < 0 THEN score_freshness := 40;
        ELSIF days_since_verified >= 180 THEN score_freshness := 0;
        ELSE score_freshness := FLOOR(40 * (1.0 - (days_since_verified::numeric / 180.0)));
        END IF;
    END IF;

    -- Fiabilité (max 40)
    domain := substring(s.source_url from 'https?://([^/]+)');
    IF domain IS NULL THEN score_reliability := 0;
    ELSIF domain ~* '\.(edu|gov|mil|ac\.[a-z]{2}|gouv\.[a-z]{2})(\.|$)' THEN score_reliability := 40;
    ELSE score_reliability := 32;
    END IF;

    -- Stabilité (max 20)
    IF s.last_check_status IS NULL OR (s.last_check_status >= 200 AND s.last_check_status < 300) THEN
        score_stability := 20;
    ELSIF s.last_check_status = 404 OR s.last_check_status = 410 THEN
        score_stability := 0;
    ELSE
        score_stability := 10;
    END IF;

    RETURN score_freshness + score_reliability + score_stability;
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION trigger_update_health_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.health_score := calculate_health_score_value(NEW);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_health_score ON scholarships;
CREATE TRIGGER set_health_score
    BEFORE INSERT OR UPDATE OF last_verified_at, source_url, last_check_status
    ON scholarships
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_health_score();

CREATE OR REPLACE FUNCTION recalc_all_scores()
RETURNS void AS $$
BEGIN
    UPDATE scholarships
    SET health_score = calculate_health_score_value(scholarships)
    WHERE status NOT IN ('ARCHIVED', 'DEPRECATED');
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.schedule('nightly-score-update', '0 3 * * *', 'SELECT recalc_all_scores()');
    END IF;
END $$;

-- ============================================================
-- ÉTAPE 5 : url_checks + dégradation automatique
-- ============================================================

CREATE TABLE IF NOT EXISTS url_checks (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scholarship_id UUID NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
    status_code    INTEGER,
    latency_ms     INTEGER,
    error_message  TEXT,
    checked_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_url_checks_scholarship_id ON url_checks(scholarship_id);
CREATE INDEX IF NOT EXISTS idx_url_checks_checked_at     ON url_checks(checked_at);

CREATE OR REPLACE FUNCTION process_url_check_result()
RETURNS TRIGGER AS $$
DECLARE
    last_status_code INTEGER;
BEGIN
    IF NEW.status_code BETWEEN 200 AND 299 THEN RETURN NEW; END IF;

    SELECT status_code INTO last_status_code
    FROM url_checks
    WHERE scholarship_id = NEW.scholarship_id AND checked_at < NEW.checked_at
    ORDER BY checked_at DESC LIMIT 1;

    IF last_status_code IS NOT NULL AND (last_status_code < 200 OR last_status_code >= 300) THEN
        UPDATE scholarships
        SET status = 'REVIEW_NEEDED'
        WHERE id = NEW.scholarship_id AND status = 'VERIFIED';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_url_check_inserted ON url_checks;
CREATE TRIGGER on_url_check_inserted
    AFTER INSERT ON url_checks
    FOR EACH ROW
    EXECUTE FUNCTION process_url_check_result();

-- ============================================================
-- ÉTAPE 6 : Fonctions admin
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin';
$$;

CREATE OR REPLACE FUNCTION set_admin_role(target_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
  WHERE id = target_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION revoke_admin_role(target_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data - 'role'
  WHERE id = target_user_id;
END;
$$;

-- Confirme l'email admin si l'utilisateur existe
DO $$
BEGIN
  UPDATE auth.users SET email_confirmed_at = NOW()
  WHERE email = 'admin@admin.com' AND email_confirmed_at IS NULL;
END $$;

-- ============================================================
-- ÉTAPE 7 : Données initiales (10 bourses)
-- ============================================================

TRUNCATE TABLE scholarships RESTART IDENTITY CASCADE;

INSERT INTO scholarships (
  name, source_url, status, provider, scholarship_type, level,
  domain, country, tags, description, deadline_at,
  amount_min, amount_max, currency, last_verified_at, data
) VALUES

('Bourse d''Excellence Eiffel',
 'https://www.campusfrance.org/fr/eiffel',
 'VERIFIED',
 'Campus France / Ministère de l''Europe et des Affaires étrangères',
 'MERIT', 'MASTER',
 ARRAY['Sciences', 'Droit', 'Économie', 'Sciences politiques'],
 'France',
 ARRAY['mobilité', 'excellence', 'international', 'master'],
 'La bourse Eiffel est destinée aux étudiants étrangers de haut niveau souhaitant poursuivre des études en master en France. Elle couvre les frais de vie, de transport et d''assurance maladie.',
 NOW() + INTERVAL '3 months', 1181, 1400, 'EUR', NOW(),
 '{"eligibility":{"level":"Master","age_limit":30,"nationality":"Étrangers hors UE","gpa":"Excellent dossier académique"},"benefits":["Allocation mensuelle","Billet d''avion","Assurance maladie","Activités culturelles"],"meta":{}}'::jsonb),

('Bourse sur Critères Sociaux (BCS) CROUS',
 'https://www.etudiant.gouv.fr/fr/bourse-et-logement/demande-de-bourse',
 'VERIFIED',
 'CROUS / Ministère de l''Enseignement Supérieur',
 'NEED_BASED', 'BACHELOR',
 ARRAY['Toutes filières'],
 'France',
 ARRAY['social', 'aide financière', 'public', 'annuel'],
 'Les bourses sur critères sociaux sont attribuées aux étudiants français ou UE en formation initiale selon les ressources du foyer fiscal. Elles vont de l''échelon 0bis à l''échelon 7.',
 NOW() + INTERVAL '2 months', 100, 5914, 'EUR', NOW(),
 '{"eligibility":{"nationality":"Française ou UE","level":"Bac+1 à Bac+5","conditions":"Ressources du foyer fiscal, âge < 28 ans"},"echelons":[0,1,2,3,4,5,6,7],"meta":{}}'::jsonb),

('Bourse Erasmus+ Mobilité Étudiante',
 'https://erasmus-plus.ec.europa.eu/fr',
 'VERIFIED',
 'Commission Européenne / Agence Erasmus+ France',
 'MOBILITY', 'BACHELOR',
 ARRAY['Toutes filières'],
 'Europe',
 ARRAY['mobilité', 'europe', 'échange', 'semestre'],
 'Erasmus+ finance des séjours d''études ou de stages à l''étranger en Europe. Le montant varie selon le pays de destination et les ressources de l''étudiant.',
 NOW() + INTERVAL '4 months', 250, 700, 'EUR', NOW(),
 '{"eligibility":{"level":"Bac+1 minimum","duration":"2 à 12 mois","conditions":"Inscrit dans un établissement partenaire"},"benefits":["Allocation mensuelle","Couverture sociale","Cours de langue"],"meta":{}}'::jsonb),

('Contrat Doctoral ANR — Programme Jeunes Chercheurs',
 'https://anr.fr/fr/financer-votre-projet/appels-ouverts/',
 'VERIFIED',
 'Agence Nationale de la Recherche (ANR)',
 'RESEARCH', 'PHD',
 ARRAY['Sciences', 'Ingénierie', 'Numérique', 'Santé'],
 'France',
 ARRAY['recherche', 'doctorat', 'financement', 'public'],
 'L''ANR finance des contrats doctoraux sur appel à projets. Le financement couvre 3 ans de thèse avec un salaire mensuel brut conforme à la grille des personnels contractuels de l''État.',
 NOW() + INTERVAL '5 months', 2000, 2200, 'EUR', NOW(),
 '{"eligibility":{"level":"Doctorat","status":"Inscription en 1ère année de thèse","domains":["Toutes disciplines scientifiques"]},"duration":"36 mois","meta":{}}'::jsonb),

('Bourse L''Oréal-UNESCO Pour les Femmes et la Science',
 'https://www.fondationloreal.com/fr/programme/pour-les-femmes-et-la-science',
 'VERIFIED',
 'Fondation L''Oréal & UNESCO',
 'DIVERSITY', 'PHD',
 ARRAY['Sciences', 'Biologie', 'Chimie', 'Physique', 'Mathématiques'],
 'France',
 ARRAY['femmes', 'sciences', 'diversité', 'doctorat', 'recherche'],
 'Ce programme récompense des doctorantes et post-doctorantes en France exerçant dans les sciences de la vie, physiques, et mathématiques. 35 bourses nationales attribuées chaque année.',
 NOW() + INTERVAL '6 months', 15000, 15000, 'EUR', NOW(),
 '{"eligibility":{"gender":"Femme","level":"Doctorat ou post-doctorat","nationality":"Toutes"},"selection_process":"Jury scientifique","meta":{}}'::jsonb),

('Aide à la Mobilité Internationale (AMI)',
 'https://www.enseignementsup-recherche.gouv.fr/fr/aide-a-la-mobilite-internationale',
 'VERIFIED',
 'Ministère de l''Enseignement Supérieur',
 'MOBILITY', 'MASTER',
 ARRAY['Toutes filières'],
 'International',
 ARRAY['mobilité', 'aide', 'stage', 'semestre', 'boursier CROUS'],
 'L''AMI est réservée aux boursiers sur critères sociaux partant en mobilité internationale (stage ou séjour d''études hors Europe). Forfait unique selon la destination.',
 NOW() + INTERVAL '2 months', 400, 700, 'EUR', NOW(),
 '{"eligibility":{"conditions":"Être boursier CROUS","destination":"Hors Europe"},"meta":{}}'::jsonb),

('Bourse Régionale Île-de-France — DIM',
 'https://www.iledefrance.fr/aides-regionales-pour-les-lycees-les-etudiants-et-les-familles',
 'VERIFIED',
 'Région Île-de-France',
 'MERIT', 'MASTER',
 ARRAY['Sciences', 'Technologie', 'Innovation', 'Numérique'],
 'France',
 ARRAY['régional', 'idf', 'innovation', 'master'],
 'La Région Île-de-France soutient les masters recherche via des Domaines d''Intérêt Majeur (DIM). Les bourses financent des projets de recherche interdisciplinaires portés par des étudiants en master.',
 NOW() + INTERVAL '3 months', 500, 1000, 'EUR', NOW(),
 '{"eligibility":{"level":"Master Recherche","region":"Île-de-France"},"meta":{}}'::jsonb),

('Programme Fulbright France',
 'https://www.fulbright-france.org/programme-fulbright',
 'VERIFIED',
 'Commission Franco-Américaine Fulbright',
 'MERIT', 'MASTER',
 ARRAY['Sciences humaines', 'Sciences sociales', 'Arts', 'Sciences'],
 'États-Unis',
 ARRAY['usa', 'mobilité', 'franco-américain', 'prestigieux'],
 'Le programme Fulbright permet à des étudiants français de poursuivre des études ou des recherches aux États-Unis pendant 9 à 12 mois. Couverture complète des frais de vie et de scolarité.',
 NOW() + INTERVAL '4 months', 0, 0, 'USD', NOW(),
 '{"eligibility":{"nationality":"Française","level":"Master ou Doctorat","language":"Anglais courant requis"},"benefits":["Scolarité intégrale","Allocation mensuelle","Billet avion A/R","Assurance"],"meta":{}}'::jsonb),

('Bourse AGEFIPh — Étudiants en Situation de Handicap',
 'https://www.agefiph.fr/aides-handicap/aide-a-la-formation',
 'VERIFIED',
 'Association de Gestion du Fonds pour l''Insertion des Personnes Handicapées',
 'NEED_BASED', 'ANY',
 ARRAY['Toutes filières'],
 'France',
 ARRAY['handicap', 'inclusion', 'aide', 'accessibilité'],
 'L''AGEFIPh apporte une aide financière complémentaire aux étudiants en situation de handicap pour couvrir des frais liés à leur formation (aménagements, matériel spécialisé).',
 NULL, 500, 5000, 'EUR', NOW(),
 '{"eligibility":{"conditions":"RQTH ou bénéficiaire de l''obligation d''emploi","level":"Toute formation professionnalisante"},"meta":{}}'::jsonb),

('Bourse DAAD — Séjours de Recherche en Allemagne',
 'https://www.daad.de/fr/le-daad/',
 'VERIFIED',
 'Office Allemand d''Échanges Universitaires (DAAD)',
 'RESEARCH', 'PHD',
 ARRAY['Sciences', 'Ingénierie', 'Sciences humaines', 'Arts'],
 'Allemagne',
 ARRAY['allemagne', 'recherche', 'europe', 'franco-allemand'],
 'Le DAAD offre des bourses de recherche pour des séjours courts (1 à 6 mois) en Allemagne, destinées aux chercheurs et doctorants français souhaitant collaborer avec des institutions allemandes.',
 NOW() + INTERVAL '5 months', 1200, 1500, 'EUR', NOW(),
 '{"eligibility":{"nationality":"Française","level":"Doctorat ou post-doctorat","language":"Allemand ou anglais"},"duration":"1 à 6 mois","meta":{}}'::jsonb);

-- ============================================================
-- ÉTAPE 8 : Utilisateur admin par défaut
-- Credentials : admin@traillearn.com / TrailLearn2026!
-- IMPORTANT : changer le mot de passe après la première connexion
-- ============================================================

DO $$
DECLARE
  v_user_id uuid;
  v_email    text := 'admin@traillearn.com';
  v_password text := 'TrailLearn2026!';
BEGIN

  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id, instance_id,
      email, encrypted_password,
      email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      created_at, updated_at,
      confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      v_email,
      crypt(v_password, gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
      '{"name":"Admin TrailLearn"}'::jsonb,
      false, 'authenticated', 'authenticated',
      now(), now(),
      '', '', '', ''
    );

    INSERT INTO auth.identities (
      provider_id, user_id,
      identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_email, v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email),
      'email', now(), now(), now()
    ) ON CONFLICT DO NOTHING;

    RAISE NOTICE '✓ Utilisateur admin créé → %', v_email;

  ELSE
    UPDATE auth.users
    SET
      raw_app_meta_data  = raw_app_meta_data || '{"role":"admin"}'::jsonb,
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at         = now()
    WHERE id = v_user_id;

    RAISE NOTICE '✓ Rôle admin accordé à l''utilisateur existant → %', v_email;
  END IF;

END $$;

-- ============================================================
-- FIN — Vérification
-- ============================================================
SELECT COUNT(*) AS total_bourses FROM scholarships;
SELECT email, raw_app_meta_data->>'role' AS role FROM auth.users WHERE email = 'admin@traillearn.com';
SELECT COUNT(*) AS total_audit   FROM audit_logs;
