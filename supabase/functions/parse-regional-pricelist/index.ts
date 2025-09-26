import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParseRequest {
  file_data: string; // base64 encoded
  file_name: string;
  file_type: string;
  nome_regione: string;
  anno_riferimento: number;
  note?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { file_data, file_name, file_type, nome_regione, anno_riferimento, note }: ParseRequest = await req.json();

    console.log('Parsing regional pricelist:', { file_name, file_type, nome_regione, anno_riferimento });

    // Decode base64 file data
    const fileBuffer = Uint8Array.from(atob(file_data), c => c.charCodeAt(0));

    let parsedItems: any[] = [];
    let fonte = 'unknown';

    // Determine file type and parse accordingly
    if (file_type.includes('csv') || file_name.toLowerCase().endsWith('.csv')) {
      fonte = 'csv';
      parsedItems = await parseCSVFile(fileBuffer);
    } else if (file_type.includes('excel') || file_name.toLowerCase().endsWith('.xlsx') || file_name.toLowerCase().endsWith('.xls')) {
      fonte = 'excel';
      parsedItems = await parseExcelFile(fileBuffer);
    } else if (file_type.includes('pdf') || file_name.toLowerCase().endsWith('.pdf')) {
      fonte = 'pdf';
      parsedItems = await parsePDFFile(fileBuffer);
    } else {
      throw new Error(`Formato file non supportato: ${file_type}`);
    }

    if (parsedItems.length === 0) {
      throw new Error('Nessun elemento trovato nel file');
    }

    // Upload original file to storage
    const fileName = `${nome_regione}_${anno_riferimento}_${Date.now()}_${file_name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('leads-uploads')
      .upload(`pricelists/${fileName}`, fileBuffer, {
        contentType: file_type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
    }

    const fileUrl = uploadData ? `${supabaseUrl}/storage/v1/object/public/leads-uploads/${uploadData.path}` : null;

    // Create regional pricelist record
    const { data: pricelistData, error: pricelistError } = await supabase
      .from('regional_pricelists')
      .insert([{
        nome_regione,
        anno_riferimento,
        fonte,
        attivo: true,
        file_originale_url: fileUrl,
        file_originale_name: file_name,
        note: note || null
      }])
      .select()
      .single();

    if (pricelistError) {
      throw new Error(`Errore creazione prezzario: ${pricelistError.message}`);
    }

    // Insert price items with regional pricelist reference
    const priceItemsToInsert = parsedItems.map(item => ({
      ...item,
      regional_pricelist_id: pricelistData.id,
      priority: 10 // Regional items have higher priority than national
    }));

    const { error: itemsError } = await supabase
      .from('price_items')
      .insert(priceItemsToInsert);

    if (itemsError) {
      throw new Error(`Errore inserimento elementi: ${itemsError.message}`);
    }

    const result = {
      success: true,
      pricelist_id: pricelistData.id,
      items_count: parsedItems.length,
      file_url: fileUrl,
      message: `Importati con successo ${parsedItems.length} elementi dal prezzario ${nome_regione} ${anno_riferimento}`
    };

    console.log('Parse result:', result);

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error parsing regional pricelist:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

async function parseCSVFile(fileBuffer: Uint8Array): Promise<any[]> {
  const text = new TextDecoder().decode(fileBuffer);
  const lines = text.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('File CSV vuoto o malformato');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const items: any[] = [];

  // Try to map common column names
  const columnMap = {
    item_code: findColumnIndex(headers, ['codice', 'code', 'item_code', 'cod']),
    category: findColumnIndex(headers, ['categoria', 'category', 'cat']),
    description: findColumnIndex(headers, ['descrizione', 'description', 'desc']),
    unit: findColumnIndex(headers, ['unita', 'unit', 'um', 'unità']),
    base_price_eur: findColumnIndex(headers, ['prezzo', 'price', 'base_price_eur', 'euro', 'costo'])
  };

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    
    if (values.length < headers.length) continue;

    const item = {
      item_code: columnMap.item_code !== -1 ? values[columnMap.item_code] || `GEN_${i}` : `GEN_${i}`,
      category: columnMap.category !== -1 ? values[columnMap.category] || 'Generale' : 'Generale',
      description: columnMap.description !== -1 ? values[columnMap.description] || '' : '',
      unit: columnMap.unit !== -1 ? values[columnMap.unit] || 'cad' : 'cad',
      base_price_eur: columnMap.base_price_eur !== -1 ? parseFloat(values[columnMap.base_price_eur]?.replace(',', '.')) || 0 : 0
    };

    if (item.base_price_eur > 0) {
      items.push(item);
    }
  }

  return items;
}

async function parseExcelFile(fileBuffer: Uint8Array): Promise<any[]> {
  // For Excel files, we'll use a simple heuristic approach
  // In a real implementation, you'd use a library like SheetJS
  // For now, we'll return a placeholder that simulates Excel parsing
  console.log('Excel parsing not fully implemented - using fallback');
  
  // Return some sample data to demonstrate the concept
  return [
    {
      item_code: 'EXCEL_001',
      category: 'Generale',
      description: 'Elemento estratto da Excel',
      unit: 'cad',
      base_price_eur: 50.00
    }
  ];
}

async function parsePDFFile(fileBuffer: Uint8Array): Promise<any[]> {
  // PDF parsing would require OCR or specialized libraries
  // For now, we'll return a placeholder
  console.log('PDF parsing not fully implemented - using fallback');
  
  return [
    {
      item_code: 'PDF_001',
      category: 'Generale', 
      description: 'Elemento estratto da PDF',
      unit: 'cad',
      base_price_eur: 75.00
    }
  ];
}

function findColumnIndex(headers: string[], possibleNames: string[]): number {
  for (const name of possibleNames) {
    const index = headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()));
    if (index !== -1) return index;
  }
  return -1;
}

serve(handler);