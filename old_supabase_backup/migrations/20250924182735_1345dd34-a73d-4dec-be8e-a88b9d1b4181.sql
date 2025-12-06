-- Add OTP fields to leads table
ALTER TABLE public.leads 
ADD COLUMN otp_code VARCHAR(6),
ADD COLUMN otp_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN otp_attempts INTEGER DEFAULT 0;