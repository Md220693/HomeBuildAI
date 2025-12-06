-- Enable OTP debug mode for testing
INSERT INTO public.system_settings (setting_key, setting_value, description)
VALUES ('otp_debug_mode', 'true', 'When true, OTP codes are shown in debug mode for testing without SMS provider');