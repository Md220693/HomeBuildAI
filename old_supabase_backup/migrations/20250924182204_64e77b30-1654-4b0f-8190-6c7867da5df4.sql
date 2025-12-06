-- Add scope_json column to leads table
ALTER TABLE public.leads 
ADD COLUMN scope_json JSONB;