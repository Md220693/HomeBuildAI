-- Create regional pricelists table
CREATE TABLE public.regional_pricelists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_regione TEXT NOT NULL,
  anno_riferimento INTEGER NOT NULL DEFAULT EXTRACT(year FROM now()),
  fonte TEXT NOT NULL, -- 'csv', 'excel', 'pdf'
  attivo BOOLEAN NOT NULL DEFAULT true,
  file_originale_url TEXT,
  file_originale_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.profiles(id),
  note TEXT
);

-- Add RLS policies for regional pricelists
ALTER TABLE public.regional_pricelists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage regional_pricelists" 
ON public.regional_pricelists 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Add regional pricelist reference to price_items
ALTER TABLE public.price_items 
ADD COLUMN regional_pricelist_id UUID REFERENCES public.regional_pricelists(id),
ADD COLUMN priority INTEGER DEFAULT 0; -- Higher priority = preferred for region

-- Create indexes for better performance
CREATE INDEX idx_regional_pricelists_regione_anno ON public.regional_pricelists(nome_regione, anno_riferimento);
CREATE INDEX idx_price_items_regional_pricelist ON public.price_items(regional_pricelist_id);
CREATE INDEX idx_price_items_priority ON public.price_items(priority DESC);

-- Create function to get best price item for region
CREATE OR REPLACE FUNCTION public.get_best_price_item(
  p_item_code TEXT,
  p_region TEXT DEFAULT NULL
) RETURNS TABLE (
  id UUID,
  item_code TEXT,
  category TEXT,
  unit TEXT,
  base_price_eur NUMERIC,
  description TEXT,
  regional_pricelist_id UUID,
  priority INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- First try to find regional price item for the specific region
  IF p_region IS NOT NULL THEN
    RETURN QUERY
    SELECT pi.id, pi.item_code, pi.category, pi.unit, pi.base_price_eur, 
           pi.description, pi.regional_pricelist_id, pi.priority
    FROM public.price_items pi
    JOIN public.regional_pricelists rp ON pi.regional_pricelist_id = rp.id
    WHERE pi.item_code = p_item_code 
      AND rp.nome_regione ILIKE p_region
      AND rp.attivo = true
    ORDER BY pi.priority DESC, rp.anno_riferimento DESC
    LIMIT 1;
    
    -- If found, return
    IF FOUND THEN
      RETURN;
    END IF;
  END IF;
  
  -- Fallback to national (no regional pricelist) with highest priority
  RETURN QUERY
  SELECT pi.id, pi.item_code, pi.category, pi.unit, pi.base_price_eur,
         pi.description, pi.regional_pricelist_id, pi.priority
  FROM public.price_items pi
  WHERE pi.item_code = p_item_code 
    AND pi.regional_pricelist_id IS NULL
  ORDER BY pi.priority DESC
  LIMIT 1;
  
  -- If still no match, return any match
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT pi.id, pi.item_code, pi.category, pi.unit, pi.base_price_eur,
           pi.description, pi.regional_pricelist_id, pi.priority
    FROM public.price_items pi
    WHERE pi.item_code = p_item_code
    ORDER BY pi.priority DESC
    LIMIT 1;
  END IF;
END;
$$;

-- Add update trigger for regional_pricelists
CREATE TRIGGER update_regional_pricelists_updated_at
  BEFORE UPDATE ON public.regional_pricelists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();