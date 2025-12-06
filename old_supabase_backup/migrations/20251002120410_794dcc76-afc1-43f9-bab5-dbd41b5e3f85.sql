-- Add supplier email confirmation setting to system_settings
INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES (
  'supplier_email_confirmation_required',
  'false',
  'Se true, i fornitori devono confermare l''email prima di accedere'
)
ON CONFLICT (setting_key) DO NOTHING;