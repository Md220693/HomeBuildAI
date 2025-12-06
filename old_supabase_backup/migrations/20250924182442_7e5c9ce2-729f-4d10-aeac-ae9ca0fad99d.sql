-- Add confidence field to leads table
ALTER TABLE public.leads 
ADD COLUMN confidence DECIMAL(3,2),
ADD COLUMN disclaimer TEXT DEFAULT 'La stima è indicativa e basata sui dati forniti. È necessario un sopralluogo per preventivo vincolante.';