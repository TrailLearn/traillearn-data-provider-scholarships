-- Promote admin@admin.com to admin role
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'admin@admin.com';

  IF target_user_id IS NOT NULL THEN
    PERFORM set_admin_role(target_user_id);
    RAISE NOTICE 'User admin@admin.com promoted to admin';
  ELSE
    RAISE NOTICE 'User admin@admin.com not found - please sign up first';
  END IF;
END $$;
