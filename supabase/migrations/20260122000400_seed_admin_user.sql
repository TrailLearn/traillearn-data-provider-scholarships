-- ============================================================
-- Seed : utilisateur admin par défaut
-- Credentials : admin@traillearn.com / TrailLearn2026!
-- IMPORTANT : changer le mot de passe après la première connexion
-- ============================================================

DO $$
DECLARE
  v_user_id uuid;
  v_email    text := 'admin@traillearn.com';
  v_password text := 'TrailLearn2026!';
BEGIN

  -- 1. Vérifier si l'utilisateur existe déjà
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;

  IF v_user_id IS NULL THEN
    -- 2a. Créer le nouvel utilisateur
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role,
      aud,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      v_email,
      crypt(v_password, gen_salt('bf')),
      now(),  -- email déjà confirmé (pas de vérification requise)
      '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
      '{"name":"Admin TrailLearn"}'::jsonb,
      false,
      'authenticated',
      'authenticated',
      now(),
      now(),
      '', '', '', ''
    );

    -- 3. Créer l'entrée identité email
    INSERT INTO auth.identities (
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      v_email,
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', v_email),
      'email',
      now(),
      now(),
      now()
    ) ON CONFLICT DO NOTHING;

    RAISE NOTICE '✓ Utilisateur admin créé → %', v_email;

  ELSE
    -- 2b. Utilisateur existant : promouvoir en admin
    UPDATE auth.users
    SET
      raw_app_meta_data   = raw_app_meta_data || '{"role":"admin"}'::jsonb,
      email_confirmed_at  = COALESCE(email_confirmed_at, now()),
      updated_at          = now()
    WHERE id = v_user_id;

    RAISE NOTICE '✓ Rôle admin accordé à l''utilisateur existant → %', v_email;

  END IF;

END $$;
