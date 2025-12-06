-- Update storage policies for PDF downloads
CREATE POLICY "Anyone can download PDFs" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'leads-uploads' AND name LIKE 'pdfs/%');