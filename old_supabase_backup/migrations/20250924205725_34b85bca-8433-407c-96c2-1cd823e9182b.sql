-- Update user role to admin and add admin permissions
UPDATE public.profiles 
SET role = 'admin'
WHERE email = 'whoisno@rocketmail.com';

-- Add admin permissions if not already present
INSERT INTO public.user_permissions (user_id, permission, created_by)
SELECT 
  p.id,
  'manage_users'::user_permission,
  p.id
FROM public.profiles p
WHERE p.email = 'whoisno@rocketmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.user_permissions up 
    WHERE up.user_id = p.id AND up.permission = 'manage_users'
  );

-- Update password for the existing user (if needed)
UPDATE auth.users 
SET encrypted_password = crypt('1Cavallo!', gen_salt('bf'))
WHERE email = 'whoisno@rocketmail.com';