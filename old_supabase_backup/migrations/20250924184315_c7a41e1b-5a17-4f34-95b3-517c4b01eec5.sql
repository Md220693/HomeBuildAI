-- Create table for supplier leads (lead offerings)
CREATE TABLE public.supplier_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'offered' CHECK (status IN ('offered', 'purchased', 'expired', 'declined')),
  offered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  purchased_at TIMESTAMP WITH TIME ZONE,
  price DECIMAL(10,2), -- Price to purchase the lead
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lead_id, supplier_id)
);

-- Enable RLS
ALTER TABLE public.supplier_leads ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Suppliers can view their own leads" 
ON public.supplier_leads 
FOR SELECT 
USING (
  supplier_id IN (
    SELECT id FROM public.suppliers WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Suppliers can update their own leads" 
ON public.supplier_leads 
FOR UPDATE 
USING (
  supplier_id IN (
    SELECT id FROM public.suppliers WHERE user_id = auth.uid()
  )
);

-- Create payments table
CREATE TABLE public.supplier_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  supplier_lead_id UUID NOT NULL REFERENCES public.supplier_leads(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'stripe',
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.supplier_payments ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Suppliers can view their own payments" 
ON public.supplier_payments 
FOR SELECT 
USING (
  supplier_id IN (
    SELECT id FROM public.suppliers WHERE user_id = auth.uid()
  )
);

-- Add triggers for timestamps
CREATE TRIGGER update_supplier_leads_updated_at
BEFORE UPDATE ON public.supplier_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supplier_payments_updated_at
BEFORE UPDATE ON public.supplier_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();