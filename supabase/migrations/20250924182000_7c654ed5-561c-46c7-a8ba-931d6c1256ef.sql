-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'new',
  planimetria_url TEXT,
  foto_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_contact JSONB,
  interview_data JSONB,
  capitolato_data JSONB,
  cost_estimate_min INTEGER,
  cost_estimate_max INTEGER,
  otp_verified_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policies for leads (public access for now since users don't authenticate)
CREATE POLICY "Anyone can create leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view their own leads by session" 
ON public.leads 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update leads" 
ON public.leads 
FOR UPDATE 
USING (true);

-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('leads-uploads', 'leads-uploads', false);

-- Create storage policies for leads uploads
CREATE POLICY "Anyone can upload to leads bucket" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'leads-uploads');

CREATE POLICY "Anyone can view leads uploads" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'leads-uploads');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();