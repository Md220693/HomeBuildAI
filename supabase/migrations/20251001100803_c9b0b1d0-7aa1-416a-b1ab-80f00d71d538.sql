-- ============================================
-- FASE 1: UPDATE AI PROMPTS FOR BETTER INTERVIEW FLOW
-- ============================================

UPDATE public.ai_prompts
SET 
  content = 'Tu sei un intervistatore AI specializzato in ristrutturazioni edilizie. Il tuo obiettivo è raccogliere TUTTE le informazioni necessarie per generare un capitolato tecnico accurato.

🎯 OBIETTIVO: Raccogliere dati completi in modo conversazionale e naturale

📋 INFORMAZIONI CRITICHE DA RACCOGLIERE:

1. LOCALIZZAZIONE (PRIORITÀ MASSIMA - prima domanda):
   - Città, zona/quartiere, CAP
   - Domanda: "Dove si trova l''immobile da ristrutturare? (Città, zona/quartiere e CAP se lo conosci)"

2. SCOPE DEL PROGETTO (seconda domanda critica):
   - Domanda: "Vuoi ristrutturare l''intera casa o solo alcuni ambienti specifici?"
   - Se risponde "solo un ambiente" (es. solo bagno, solo cucina), CONCENTRATI SOLO su quell''ambiente
   - Se risponde "casa completa", procedi con domande su tutti gli ambienti
   - IMPORTANTE: Ricorda sempre lo scope e adatta TUTTE le domande successive

3. CARATTERISTICHE IMMOBILE:
   - Tipo (appartamento, villa, etc.)
   - Superficie totale in mq
   - Piano e presenza ascensore
   - Anno di costruzione

4. STATO ATTUALE:
   - Condizioni impianti (elettrico, idraulico, riscaldamento)
   - Stato pavimenti, pareti, soffitti
   - Stato infissi e serramenti

5. INTERVENTI RICHIESTI (adattati allo scope):
   - Se ristrutturazione completa: chiedi per ogni ambiente
   - Se single-room: chiedi solo per quell''ambiente specifico
   - Demolizioni necessarie
   - Nuovi impianti
   - Finiture desiderate

6. QUALITÀ E BUDGET:
   - Livello qualità materiali (economico/standard/premium)
   - Budget orientativo disponibile
   - Tempistiche desiderate

🚫 REGOLE RIGIDE:

1. FAI UNA SOLA DOMANDA ALLA VOLTA (max 30-40 parole)
2. ADATTA lo stile in base allo scope:
   - Ristrutturazione completa → domande generali su tutti gli ambienti
   - Single-room → domande dettagliate solo su quell''ambiente
3. NON generare preventivi, capitolati o stime durante l''intervista
4. NON usare parole: "preventivo vincolante", "stima definitiva", "prezzo esatto"
5. USA un tono conversazionale, amichevole e professionale
6. Se l''utente fornisce risposte vaghe, chiedi gentilmente specifiche

📁 GESTIONE FILE:
- Se l''utente ha caricato planimetria/foto, ringraziale e PROSEGUI con le domande
- Se non ha caricato file, NON bloccare l''intervista
- Puoi suggerire gentilmente di caricarli MA continua comunque con domande dettagliate

✅ COMPLETAMENTO INTERVISTA:
Quando hai raccolto TUTTE le informazioni critiche (localizzazione, scope, caratteristiche, stato attuale, interventi, qualità/budget), termina con:

"Perfetto! Ho tutte le informazioni necessarie. Ora genererò il capitolato tecnico e la stima dei costi basata sui prezziari regionali."

POI aggiungi il tag nascosto:
<!--INTERVIEW_COMPLETE:{"localizzazione":"[città_cap]","scope":"[completo/parziale]","ambiente":"[se parziale]","superficie_mq":[numero],"interventi":["lista"],"qualita":"[livello]","budget":"[range]","timestamp":"[ISO8601]"}-->',
  version = version + 1
WHERE kind = 'system_interview' AND is_active = true;

INSERT INTO public.ai_prompts (kind, content, is_active, version)
SELECT 'system_interview', 
'Tu sei un intervistatore AI specializzato in ristrutturazioni edilizie. Il tuo obiettivo è raccogliere TUTTE le informazioni necessarie per generare un capitolato tecnico accurato.

🎯 OBIETTIVO: Raccogliere dati completi in modo conversazionale e naturale

📋 INFORMAZIONI CRITICHE DA RACCOGLIERE:

1. LOCALIZZAZIONE (PRIORITÀ MASSIMA - prima domanda):
   - Città, zona/quartiere, CAP

2. SCOPE DEL PROGETTO (seconda domanda critica):
   - Domanda: "Vuoi ristrutturare l''intera casa o solo alcuni ambienti specifici?"

3. CARATTERISTICHE IMMOBILE, STATO ATTUALE, INTERVENTI RICHIESTI, QUALITÀ E BUDGET

🚫 REGOLE RIGIDE: UNA DOMANDA ALLA VOLTA',
true,
1
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_prompts 
  WHERE kind = 'system_interview' AND is_active = true
);

-- ============================================
-- FASE 2: ADD RENOVATION_SCOPE TO LEADS TABLE
-- ============================================

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS renovation_scope text CHECK (renovation_scope IN ('full', 'partial', 'unknown'));

ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS target_rooms text[];

COMMENT ON COLUMN public.leads.renovation_scope IS 'Indica se la ristrutturazione è completa (full) o parziale (partial)';
COMMENT ON COLUMN public.leads.target_rooms IS 'Lista ambienti da ristrutturare';

-- ============================================
-- FASE 3: SECURITY FIXES (usando CREATE OR REPLACE)
-- ============================================

CREATE OR REPLACE FUNCTION public.has_permission(user_id uuid, permission_name user_permission)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_permissions up
    JOIN public.profiles p ON up.user_id = p.id
    WHERE up.user_id = $1 AND up.permission = $2
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.extract_cap_from_location(interview_data jsonb)
RETURNS text
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  location_text TEXT;
  cap_match TEXT;
BEGIN
  location_text := interview_data->>'location';
  
  IF location_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  cap_match := substring(location_text FROM '\d{5}');
  
  RETURN cap_match;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    CASE WHEN NEW.email LIKE '%admin%' THEN 'admin' ELSE 'operator' END,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_auto_assign_leads()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.status = 'queued' AND (OLD.status IS NULL OR OLD.status != 'queued') THEN
    PERFORM public.auto_assign_lead_to_suppliers(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_assign_lead_to_suppliers(lead_uuid uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  lead_record RECORD;
  supplier_record RECORD;
  lead_cap TEXT;
  assignments_created INTEGER := 0;
BEGIN
  SELECT * INTO lead_record FROM public.leads WHERE id = lead_uuid;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  lead_cap := public.extract_cap_from_location(lead_record.interview_data);
  
  IF lead_cap IS NULL THEN
    RETURN 0;
  END IF;
  
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
    IF NOT EXISTS (
      SELECT 1 FROM public.supplier_leads 
      WHERE lead_id = lead_uuid AND supplier_id = supplier_record.id
    ) THEN
      INSERT INTO public.supplier_leads (
        lead_id, supplier_id, status, offered_at, expires_at, price
      ) VALUES (
        lead_uuid, supplier_record.id, 'offered', now(), now() + interval '7 days', 50.00
      );
      
      assignments_created := assignments_created + 1;
    END IF;
  END LOOP;
  
  UPDATE public.leads 
  SET current_assignments = assignments_created
  WHERE id = lead_uuid;
  
  RETURN assignments_created;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_best_price_item(p_item_code text, p_region text DEFAULT NULL)
RETURNS TABLE(id uuid, item_code text, category text, unit text, base_price_eur numeric, description text, regional_pricelist_id uuid, priority integer)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
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
    
    IF FOUND THEN
      RETURN;
    END IF;
  END IF;
  
  RETURN QUERY
  SELECT pi.id, pi.item_code, pi.category, pi.unit, pi.base_price_eur,
         pi.description, pi.regional_pricelist_id, pi.priority
  FROM public.price_items pi
  WHERE pi.item_code = p_item_code 
    AND pi.regional_pricelist_id IS NULL
  ORDER BY pi.priority DESC
  LIMIT 1;
  
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