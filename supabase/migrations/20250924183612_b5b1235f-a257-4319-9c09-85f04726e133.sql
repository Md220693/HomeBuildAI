-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  ragione_sociale TEXT NOT NULL,
  partita_iva VARCHAR(11) NOT NULL UNIQUE,
  sito_web TEXT,
  contatto_referente TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  zona_operativa TEXT[] NOT NULL,
  codice_condotta_accettato BOOLEAN NOT NULL DEFAULT false,
  onboarding_completato BOOLEAN NOT NULL DEFAULT false,
  attivo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Create policies for suppliers
CREATE POLICY "Suppliers can view their own profile" 
ON public.suppliers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Suppliers can update their own profile" 
ON public.suppliers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert supplier profiles" 
ON public.suppliers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all suppliers (if admin system exists)
CREATE POLICY "Authenticated users can insert suppliers during onboarding" 
ON public.suppliers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();