import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generatePDFHTML(leadData: any): string {
  const { user_contact, capitolato_data, cost_estimate_min, cost_estimate_max, confidence, disclaimer, foto_urls, planimetria_url } = leadData;
  
  const currentDate = new Date().toLocaleDateString('it-IT');
  const costRange = `€${cost_estimate_min?.toLocaleString('it-IT')} - €${cost_estimate_max?.toLocaleString('it-IT')}`;
  const confidencePercent = Math.round((confidence || 0.7) * 100);
  
  const sectionTitles = {
    demolizioni: "Demolizioni e Preparazione",
    impianti_elettrici: "Impianti Elettrici",
    impianti_idraulici: "Impianti Idraulici/Termici",
    murature: "Murature e Tramezzi",
    massetti: "Massetti e Sottofondi",
    pavimenti: "Pavimenti e Rivestimenti",
    serramenti: "Serramenti e Infissi",
    pitturazioni: "Pitturazioni e Finiture",
    opere_accessorie: "Opere Accessorie"
  };

  return `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Capitolato BuildHomeAI</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
        }
        
        .page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 20mm;
            background: white;
            page-break-after: always;
        }
        
        .page:last-child {
            page-break-after: avoid;
        }
        
        /* Cover Page */
        .cover-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            min-height: 257mm;
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            position: relative;
        }
        
        .logo-section {
            margin-bottom: 40px;
        }
        
        .logo-text {
            font-size: 48px;
            font-weight: bold;
            margin-bottom: 10px;
            letter-spacing: -1px;
        }
        
        .logo-subtitle {
            font-size: 18px;
            opacity: 0.9;
            font-weight: 300;
        }
        
        .cover-title {
            font-size: 36px;
            font-weight: bold;
            margin: 40px 0 20px 0;
            line-height: 1.2;
        }
        
        .client-info {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            margin: 30px 0;
            backdrop-filter: blur(10px);
        }
        
        .client-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .client-address {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .cover-date {
            position: absolute;
            bottom: 30px;
            font-size: 16px;
            opacity: 0.8;
        }
        
        /* Content Pages */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 20px;
            border-bottom: 3px solid #2563eb;
            margin-bottom: 30px;
        }
        
        .header-logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
        }
        
        .page-number {
            color: #666;
            font-size: 14px;
        }
        
        h1 {
            font-size: 28px;
            color: #2563eb;
            margin-bottom: 20px;
            font-weight: bold;
        }
        
        h2 {
            font-size: 22px;
            color: #2563eb;
            margin: 30px 0 15px 0;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
        }
        
        h3 {
            font-size: 18px;
            color: #374151;
            margin: 20px 0 10px 0;
            font-weight: 600;
        }
        
        .cost-summary {
            background: #f8fafc;
            border: 2px solid #2563eb;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
        }
        
        .cost-amount {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            margin: 10px 0;
        }
        
        .confidence-badge {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 600;
            margin: 10px 0;
        }
        
        .section {
            margin-bottom: 35px;
            page-break-inside: avoid;
        }
        
        .section-content {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
        }
        
        .description {
            margin-bottom: 20px;
            font-size: 16px;
            line-height: 1.7;
        }
        
        .subsection {
            margin: 15px 0;
        }
        
        .subsection h4 {
            font-size: 16px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
        }
        
        ul {
            margin: 8px 0;
            padding-left: 20px;
        }
        
        li {
            margin: 6px 0;
            line-height: 1.5;
        }
        
        .materials-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 10px 0;
        }
        
        .material-tag {
            background: #e5e7eb;
            color: #374151;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
        }
        
        .disclaimer-box {
            background: #fef3cd;
            border: 2px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
        }
        
        .disclaimer-title {
            font-weight: bold;
            color: #92400e;
            margin-bottom: 10px;
            font-size: 18px;
        }
        
        .disclaimer-text {
            color: #92400e;
            line-height: 1.6;
        }
        
        .attachments-section {
            margin-top: 30px;
        }
        
        .attachment-item {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            border-left: 4px solid #6b7280;
        }
        
        .attachment-name {
            font-weight: 600;
            color: #374151;
        }
        
        .attachment-type {
            color: #6b7280;
            font-size: 14px;
        }
        
        .footer {
            position: fixed;
            bottom: 15mm;
            left: 20mm;
            right: 20mm;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
        }
        
        @media print {
            .page {
                margin: 0;
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <!-- Cover Page -->
    <div class="page cover-page">
        <div class="logo-section">
            <div class="logo-text">BuildHomeAI</div>
            <div class="logo-subtitle">Intelligenza Artificiale per la Ristrutturazione</div>
        </div>
        
        <h1 class="cover-title">Capitolato Tecnico<br/>Personalizzato</h1>
        
        <div class="client-info">
            <div class="client-name">${user_contact?.nome || ''} ${user_contact?.cognome || ''}</div>
            <div class="client-address">${user_contact?.indirizzo || ''}</div>
        </div>
        
        <div class="cover-date">Generato il ${currentDate}</div>
    </div>
    
    <!-- Summary Page -->
    <div class="page">
        <div class="header">
            <div class="header-logo">BuildHomeAI</div>
            <div class="page-number">Pagina 2</div>
        </div>
        
        <h1>Riepilogo Progetto</h1>
        
        <div class="cost-summary">
            <h3>Stima Costi del Progetto</h3>
            <div class="cost-amount">${costRange}</div>
            <div class="confidence-badge">Affidabilità: ${confidencePercent}%</div>
        </div>
        
        <div class="disclaimer-box">
            <div class="disclaimer-title">⚠️ Importante</div>
            <div class="disclaimer-text">
                ${disclaimer || 'La stima è indicativa e basata sui dati forniti. È necessario un sopralluogo per preventivo vincolante.'}
            </div>
        </div>
        
        <h2>Allegati Forniti</h2>
        <div class="attachments-section">
            ${planimetria_url ? `
            <div class="attachment-item">
                <div class="attachment-name">📋 Planimetria</div>
                <div class="attachment-type">Documento tecnico fornito dal cliente</div>
            </div>
            ` : ''}
            
            ${foto_urls && foto_urls.length > 0 ? `
            <div class="attachment-item">
                <div class="attachment-name">📸 Fotografie Immobile</div>
                <div class="attachment-type">${foto_urls.length} foto fornite dal cliente</div>
            </div>
            ` : ''}
        </div>
    </div>
    
    <!-- Capitolato Sections -->
    ${capitolato_data ? Object.entries(capitolato_data).map(([key, section]: [string, any], index: number) => `
    <div class="page">
        <div class="header">
            <div class="header-logo">BuildHomeAI</div>
            <div class="page-number">Pagina ${3 + index}</div>
        </div>
        
        <div class="section">
            <h2>${sectionTitles[key as keyof typeof sectionTitles] || key}</h2>
            
            <div class="section-content">
                <div class="description">
                    <strong>Descrizione:</strong> ${section.descrizione || 'Non specificato'}
                </div>
                
                ${section.lavorazioni && section.lavorazioni.length > 0 ? `
                <div class="subsection">
                    <h4>🔨 Lavorazioni Previste:</h4>
                    <ul>
                        ${section.lavorazioni.map((item: string) => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${section.materiali && section.materiali.length > 0 ? `
                <div class="subsection">
                    <h4>🏗️ Materiali:</h4>
                    <div class="materials-list">
                        ${section.materiali.map((item: string) => `<span class="material-tag">${item}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${section.quantita_stimate ? `
                <div class="subsection">
                    <h4>📊 Quantità Stimate:</h4>
                    <p>${section.quantita_stimate}</p>
                </div>
                ` : ''}
            </div>
        </div>
    </div>
    `).join('') : ''}
    
    <div class="footer">
        <strong>BuildHomeAI</strong> è un intermediario tecnologico e non è responsabile dell'esecuzione dei lavori. 
        Per informazioni: info@buildhomeai.com
    </div>
</body>
</html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId } = await req.json();
    
    if (!leadId) {
      throw new Error('leadId is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get lead data
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      throw new Error('Lead not found');
    }

    console.log('Generating PDF for lead:', leadId);

    // Generate HTML content
    const htmlContent = generatePDFHTML(lead);
    
    // Convert HTML to PDF using a web service (placeholder - replace with actual PDF service)
    // For now, we'll create a simple text-based PDF simulation
    const pdfBuffer = new TextEncoder().encode(htmlContent);
    
    // Upload PDF to Supabase storage
    const fileName = `capitolato-${leadId}-${Date.now()}.pdf`;
    const filePath = `pdfs/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('leads-uploads')
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error('Failed to upload PDF');
    }

    // Get public URL for the PDF
    const { data: urlData } = await supabase.storage
      .from('leads-uploads')
      .getPublicUrl(filePath);

    const pdfUrl = urlData.publicUrl;

    // Update lead with PDF URL
    const { error: updateError } = await supabase
      .from('leads')
      .update({ pdf_url: pdfUrl })
      .eq('id', leadId);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to save PDF URL');
    }

    console.log('PDF generated and saved successfully:', pdfUrl);

    return new Response(JSON.stringify({
      success: true,
      pdf_url: pdfUrl,
      message: 'PDF generato e salvato con successo'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-pdf function:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'An error occurred generating PDF'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});