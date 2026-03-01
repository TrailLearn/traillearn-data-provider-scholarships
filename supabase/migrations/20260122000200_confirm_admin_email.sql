-- Confirm email for admin@admin.com manually (skip email verification)
DO $$
BEGIN
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE email = 'admin@admin.com' AND email_confirmed_at IS NULL;

  IF FOUND THEN
    RAISE NOTICE 'Email for admin@admin.com confirmed manually';
  ELSE
    RAISE NOTICE 'Email for admin@admin.com was already confirmed or user not found';
  END IF;
END $$;
