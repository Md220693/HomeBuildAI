-- Add geographical mapping columns to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS cap TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS citta TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS regione TEXT;

-- Create indexes for performance on geographical searches
CREATE INDEX IF NOT EXISTS idx_leads_regione ON leads(regione);
CREATE INDEX IF NOT EXISTS idx_leads_cap ON leads(cap);

-- Add comment for documentation
COMMENT ON COLUMN leads.cap IS 'Codice postale estratto da interview_data.location';
COMMENT ON COLUMN leads.citta IS 'Città estratta da interview_data.location';
COMMENT ON COLUMN leads.regione IS 'Regione mappata automaticamente dal CAP';