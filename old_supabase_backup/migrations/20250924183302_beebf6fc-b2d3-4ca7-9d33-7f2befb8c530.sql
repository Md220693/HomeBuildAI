-- Add pdf_url column to leads table
ALTER TABLE public.leads 
ADD COLUMN pdf_url TEXT;