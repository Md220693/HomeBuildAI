-- Popola system_settings con i record necessari per le API keys gestibili dall'admin panel
-- Questo permette all'admin di configurarle tramite l'interfaccia

-- Postmark (email)
INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES 
  ('postmark_api_key', '', 'Chiave API per Postmark (invio email)')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES 
  ('postmark_server_token', '', 'Server Token per Postmark')
ON CONFLICT (setting_key) DO NOTHING;

-- Twilio (SMS/OTP)
INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES 
  ('twilio_account_sid', '', 'Account SID per Twilio (SMS/OTP)')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES 
  ('twilio_auth_token', '', 'Auth Token per Twilio')
ON CONFLICT (setting_key) DO NOTHING;

INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES 
  ('twilio_phone_number', '', 'Numero di telefono Twilio')
ON CONFLICT (setting_key) DO NOTHING;

-- Stripe (pagamenti)
INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES 
  ('stripe_secret_key', '', 'Chiave segreta Stripe per pagamenti')
ON CONFLICT (setting_key) DO NOTHING;

-- Assicuriamoci che otp_debug_mode esista
INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES 
  ('otp_debug_mode', 'false', 'Modalità debug per OTP (mostra il codice nei log)')
ON CONFLICT (setting_key) DO NOTHING;