-- Add skip_files field to leads table to track when user chooses to proceed without files
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS skip_files boolean DEFAULT false;

COMMENT ON COLUMN public.leads.skip_files IS 'Indica se l''utente ha scelto di procedere senza caricare foto o planimetria';