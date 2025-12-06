-- Add fields to leads table for assignment logic
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS assignment_type TEXT DEFAULT 'multi' CHECK (assignment_type IN ('multi', 'exclusive'));
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS max_assignments INTEGER DEFAULT 5;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS current_assignments INTEGER DEFAULT 0;

-- Add function to extract CAP from location data
CREATE OR REPLACE FUNCTION public.extract_cap_from_location(interview_data JSONB)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  location_text TEXT;
  cap_match TEXT;
BEGIN
  -- Try to extract location from interview_data
  location_text := interview_data->>'location';
  
  -- If no location, return null
  IF location_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Extract 5-digit CAP (Italian postal code pattern)
  cap_match := substring(location_text FROM '\d{5}');
  
  RETURN cap_match;
END;
$$;

-- Create function to automatically assign leads to suppliers
CREATE OR REPLACE FUNCTION public.auto_assign_lead_to_suppliers(lead_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  lead_record RECORD;
  supplier_record RECORD;
  lead_cap TEXT;
  assignments_created INTEGER := 0;
  zona_item TEXT;
BEGIN
  -- Get lead data
  SELECT * INTO lead_record FROM public.leads WHERE id = lead_uuid;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Extract CAP from lead location
  lead_cap := public.extract_cap_from_location(lead_record.interview_data);
  
  -- If no CAP found, skip assignment
  IF lead_cap IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Find active suppliers that cover this area
  FOR supplier_record IN 
    SELECT DISTINCT s.*
    FROM public.suppliers s
    WHERE s.attivo = true 
    AND s.onboarding_completato = true
    AND EXISTS (
      SELECT 1 
      FROM unnest(s.zona_operativa) AS zona_item
      WHERE zona_item ILIKE '%' || lead_cap || '%' 
         OR zona_item ILIKE '%' || substring(lead_cap FROM 1 FOR 3) || '%'
    )
  LOOP
    -- Check if assignment already exists
    IF NOT EXISTS (
      SELECT 1 FROM public.supplier_leads 
      WHERE lead_id = lead_uuid AND supplier_id = supplier_record.id
    ) THEN
      -- Create assignment
      INSERT INTO public.supplier_leads (
        lead_id, 
        supplier_id, 
        status, 
        offered_at,
        expires_at,
        price
      ) VALUES (
        lead_uuid,
        supplier_record.id,
        'offered',
        now(),
        now() + interval '7 days',
        50.00 -- Default lead price
      );
      
      assignments_created := assignments_created + 1;
    END IF;
  END LOOP;
  
  -- Update lead assignments count
  UPDATE public.leads 
  SET current_assignments = assignments_created
  WHERE id = lead_uuid;
  
  RETURN assignments_created;
END;
$$;

-- Create trigger function for automatic lead assignment
CREATE OR REPLACE FUNCTION public.trigger_auto_assign_leads()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only trigger on status change to 'queued'
  IF NEW.status = 'queued' AND (OLD.status IS NULL OR OLD.status != 'queued') THEN
    -- Call assignment function asynchronously (in a separate transaction)
    PERFORM public.auto_assign_lead_to_suppliers(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on leads table
DROP TRIGGER IF EXISTS auto_assign_leads_trigger ON public.leads;
CREATE TRIGGER auto_assign_leads_trigger
AFTER INSERT OR UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.trigger_auto_assign_leads();

-- Add policy to allow system to create supplier_leads
CREATE POLICY "System can create supplier lead assignments" 
ON public.supplier_leads 
FOR INSERT 
WITH CHECK (true);