-- Create tables for AI Trainer functionality (without vector extension)

-- AI Prompts table for versioned system prompts
CREATE TABLE IF NOT EXISTS public.ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('system_interview', 'system_pricing', 'user_template_pdf')),
  content TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(kind, version)
);

-- Interview questions for dynamic form building
CREATE TABLE IF NOT EXISTS public.interview_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  field_key TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('text', 'textarea', 'select', 'radio', 'checkbox', 'number', 'date')),
  required BOOLEAN NOT NULL DEFAULT false,
  help_text TEXT,
  options_json JSONB,
  visibility_rule JSONB,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Base price items
CREATE TABLE IF NOT EXISTS public.price_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  item_code TEXT NOT NULL UNIQUE,
  unit TEXT NOT NULL,
  base_price_eur NUMERIC(10,2) NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Geographic price modifiers
CREATE TABLE IF NOT EXISTS public.price_modifiers_geo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  province TEXT,
  cap_pattern TEXT,
  multiplier NUMERIC(5,3) NOT NULL DEFAULT 1.000,
  note TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Quality tier price modifiers
CREATE TABLE IF NOT EXISTS public.price_modifiers_quality (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quality_tier TEXT NOT NULL UNIQUE,
  multiplier NUMERIC(5,3) NOT NULL DEFAULT 1.000
);

-- Urgency price modifiers
CREATE TABLE IF NOT EXISTS public.price_modifiers_urgency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  urgency_band TEXT NOT NULL UNIQUE,
  multiplier NUMERIC(5,3) NOT NULL DEFAULT 1.000
);

-- Historical vendor quotes for calibration
CREATE TABLE IF NOT EXISTS public.vendor_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  geo TEXT NOT NULL,
  quality_tier TEXT NOT NULL,
  scope_json JSONB NOT NULL,
  total_eur NUMERIC(12,2) NOT NULL,
  normalized_lines_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Knowledge base documents (without vector for now)
CREATE TABLE IF NOT EXISTS public.kb_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  content_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI system settings
CREATE TABLE IF NOT EXISTS public.ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  use_rag BOOLEAN NOT NULL DEFAULT false,
  use_storici BOOLEAN NOT NULL DEFAULT false,
  max_neighbors INTEGER NOT NULL DEFAULT 5,
  guard_rail_pct NUMERIC(5,2) NOT NULL DEFAULT 20.00,
  default_confidence NUMERIC(5,2) NOT NULL DEFAULT 75.00,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on all tables
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_modifiers_geo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_modifiers_quality ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_modifiers_urgency ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin only access
CREATE POLICY "Admins can manage ai_prompts" ON public.ai_prompts
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can manage interview_questions" ON public.interview_questions
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can manage price_items" ON public.price_items
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can manage price_modifiers_geo" ON public.price_modifiers_geo
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can manage price_modifiers_quality" ON public.price_modifiers_quality
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can manage price_modifiers_urgency" ON public.price_modifiers_urgency
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can manage vendor_quotes" ON public.vendor_quotes
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can manage kb_docs" ON public.kb_docs
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can manage ai_settings" ON public.ai_settings
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Insert default AI settings
INSERT INTO public.ai_settings (use_rag, use_storici, max_neighbors, guard_rail_pct, default_confidence)
VALUES (false, false, 5, 20.00, 75.00)
ON CONFLICT DO NOTHING;

-- Insert default prompts
INSERT INTO public.ai_prompts (kind, content, version, is_active) VALUES
('system_interview', 'Sei un esperto consulente per ristrutturazioni che conduce interviste dettagliate per comprendere le esigenze del cliente. Fai domande mirate e approfondite per raccogliere tutte le informazioni necessarie per un preventivo accurato.', 1, true),
('system_pricing', 'Sei un esperto estimatore che calcola i costi di ristrutturazione basandoti sui dati raccolti durante l''intervista. Fornisci stime accurate e dettagliate considerando materiali, manodopera e tempistiche.', 1, true),
('user_template_pdf', 'Genera un preventivo dettagliato in formato professionale che includa: descrizione dei lavori, materiali necessari, tempistiche, costi suddivisi per categoria e note importanti.', 1, true)
ON CONFLICT (kind, version) DO NOTHING;