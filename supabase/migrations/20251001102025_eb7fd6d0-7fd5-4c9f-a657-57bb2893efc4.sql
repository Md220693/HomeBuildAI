-- ============================================
-- FINAL SECURITY FIX: Add search_path to remaining functions
-- ============================================

CREATE OR REPLACE FUNCTION public.create_subscribers_backup()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  backup_uuid UUID := gen_random_uuid();
BEGIN
  INSERT INTO public.subscribers_backup (backup_id, original_subscriber_id, backup_data, created_by)
  SELECT 
    backup_uuid,
    s.id,
    row_to_json(s)::jsonb,
    auth.uid()
  FROM public.subscribers s
  WHERE s.status = 'active';
  
  RETURN backup_uuid;
END;
$$;

CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_token text, user_password text, first_name text DEFAULT NULL, last_name text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  invitation_record RECORD;
  new_user_id UUID;
  perm user_permission;
BEGIN
  SELECT * INTO invitation_record
  FROM public.user_invitations
  WHERE invitation_token = accept_invitation.invitation_token
    AND status = 'pending'
    AND expires_at > now();

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, raw_user_meta_data, created_at, updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
    invitation_record.email, crypt(user_password, gen_salt('bf')), now(),
    jsonb_build_object('first_name', first_name, 'last_name', last_name), now(), now()
  )
  RETURNING id INTO new_user_id;

  INSERT INTO public.profiles (id, email, role, first_name, last_name)
  VALUES (new_user_id, invitation_record.email, invitation_record.role, first_name, last_name);

  FOREACH perm IN ARRAY invitation_record.permissions
  LOOP
    INSERT INTO public.user_permissions (user_id, permission, created_by)
    VALUES (new_user_id, perm, invitation_record.invited_by);
  END LOOP;

  UPDATE public.user_invitations
  SET status = 'accepted', accepted_at = now()
  WHERE id = invitation_record.id;

  RETURN jsonb_build_object('success', true, 'user_id', new_user_id);
END;
$$;