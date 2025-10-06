// v2.0.0 - Fixed ReferenceError userMessages bug (2025-10-06)
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Helper function to map CAP to Regione
function mapCapToRegione(cap: string | null): string | null {
  if (!cap) return null;
  
  const capNum = parseInt(cap);
  if (isNaN(capNum)) return null;
  
  // Map CAP ranges to regions (Italian postal code system)
  if (capNum >= 10000 && capNum <= 10999) return 'Piemonte';
  if (capNum >= 12000 && capNum <= 14999) return 'Piemonte';
  if (capNum >= 15000 && capNum <= 18999) return 'Piemonte';
  if (capNum >= 20000 && capNum <= 20999) return 'Lombardia';
  if (capNum >= 22000 && capNum <= 27100) return 'Lombardia';
  if (capNum >= 30000 && capNum <= 30399) return 'Veneto';
  if (capNum >= 31000 && capNum <= 32999) return 'Veneto';
  if (capNum >= 35000 && capNum <= 36199) return 'Veneto';
  if (capNum >= 37000 && capNum <= 37139) return 'Veneto';
  if (capNum >= 38000 && capNum <= 38999) return 'Trentino-Alto Adige';
  if (capNum >= 39000 && capNum <= 39999) return 'Trentino-Alto Adige';
  if (capNum >= 33000 && capNum <= 34999) return 'Friuli-Venezia Giulia';
  if (capNum >= 16000 && capNum <= 19999) return 'Liguria';
  if (capNum >= 40000 && capNum <= 43999) return 'Emilia-Romagna';
  if (capNum >= 44000 && capNum <= 48999) return 'Emilia-Romagna';
  if (capNum >= 47000 && capNum <= 47999) return 'Emilia-Romagna';
  if (capNum >= 50000 && capNum <= 59999) return 'Toscana';
  if (capNum >= 6000 && capNum <= 6999) return 'Umbria';
  if (capNum >= 60000 && capNum <= 63999) return 'Marche';
  if (capNum >= 0 && capNum <= 5999) return 'Lazio';
  if (capNum >= 65000 && capNum <= 67999) return 'Abruzzo';
  if (capNum >= 86000 && capNum <= 86999) return 'Molise';
  if (capNum >= 70000 && capNum <= 76999) return 'Puglia';
  if (capNum >= 85000 && capNum <= 85999) return 'Basilicata';
  if (capNum >= 80000 && capNum <= 84999) return 'Campania';
  if (capNum >= 87000 && capNum <= 89999) return 'Calabria';
  if (capNum >= 90000 && capNum <= 98999) return 'Sicilia';
  if (capNum >= 7000 && capNum <= 9999) return 'Sardegna';
  
  return null;
}

// Helper: Extract location from USER messages only (not system prompt)
// v2.0.2: Enhanced flexible location extraction (supports multiple formats)
function extractLocationFromUserMessages(messages: any[]): {
  citta: string | null;
  cap: string | null;
} {
  const normalizeCity = (city: string) => {
    return city.trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Filter only USER messages and REVERSE to search from most recent
  const userMessages = messages
    .filter(m => m.role === 'user')
    .reverse(); // 🎯 Search from most recent message first!

  let citta: string | null = null;
  let cap: string | null = null;

  // Search in reverse order (most recent first)
  for (const msg of userMessages) {
    const content = msg.content;

    // Strategy 1: City + CAP together (FLEXIBLE ORDER, case-insensitive)
    // Matches: "Catania 95127", "95127 catania", "Catania, 95127", "catania,95127", etc.
    const cityFirstMatch = content.match(/([a-zàèéìòùáíóúäëïöüâêîôûçñ\s'-]{3,})[,\s]*(\d{5})/i);
    const capFirstMatch = content.match(/(\d{5})[,\s]*([a-zàèéìòùáíóúäëïöüâêîôûçñ\s'-]{3,})/i);
    
    if (cityFirstMatch) {
      citta = normalizeCity(cityFirstMatch[1]);
      cap = cityFirstMatch[2];
      break; // ✅ Stop at first (most recent) match!
    } else if (capFirstMatch) {
      cap = capFirstMatch[1];
      citta = normalizeCity(capFirstMatch[2]);
      break; // ✅ Stop at first (most recent) match!
    }

    // Strategy 2: CAP only (if city was in a previous message)
    if (!cap) {
      const capOnly = content.match(/\b(\d{5})\b/);
      if (capOnly) {
        cap = capOnly[1];
      }
    }
  }

  return { citta, cap };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FUNCTION_VERSION = "2.0.2-complete-fix"; // All 3 fixes: DB columns, flexible location, better prompts
const DEPLOY_TIMESTAMP = "2025-10-06T16:30:00Z"; // Deploy tracking

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leadId, messages } = await req.json();
    
    console.log(`
🚀 ========================================
🚀 ai-interview-v2 v${FUNCTION_VERSION}
🚀 Deploy: ${DEPLOY_TIMESTAMP}
🚀 Lead ID: ${leadId}
🚀 ========================================
    `);
    
    if (!leadId || !messages || !Array.isArray(messages)) {
      throw new Error('leadId and messages array are required');
    }

    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get lead data to check for existing files, skip flag, and renovation scope
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select('planimetria_url, foto_urls, skip_files, renovation_scope, target_rooms')
      .eq('id', leadId)
      .single();

    if (leadError) {
      console.error('Error fetching lead data:', leadError);
      throw new Error('Failed to fetch lead data');
    }

    const hasSkippedFiles = leadData?.skip_files === true;
    const hasPlanimetria = leadData?.planimetria_url != null;
    const hasFoto = leadData?.foto_urls != null && leadData.foto_urls.length >= 4;
    const renovationScope = leadData?.renovation_scope || 'unknown';
    const targetRooms = leadData?.target_rooms || [];

    console.log('Lead context data:', { 
      planimetria_url: leadData?.planimetria_url, 
      foto_urls: leadData?.foto_urls,
      skip_files: hasSkippedFiles,
      renovation_scope: renovationScope,
      target_rooms: targetRooms
    });

    // Get system interview prompt from database
    const { data: promptData, error: promptError } = await supabase
      .from('ai_prompts')
      .select('content')
      .eq('kind', 'system_interview')
      .eq('is_active', true)
      .single();

    // Fix #3: Context-Aware File Handling
    let fileContext = '';
    if (hasSkippedFiles) {
      fileContext = `
📁 SENZA DOCUMENTI VISIVI: L'utente ha scelto di procedere SENZA foto o planimetria.
- CHIEDI in dettaglio: metrature, stato attuale (vecchio/recente), desiderata per ogni ambiente
- Esempi: "Che dimensioni ha il bagno? In che stato è attualmente? Cosa vuoi rifare?"
- Più dettagli raccogli, più accurata sarà la stima
`;
    } else if (hasPlanimetria || hasFoto) {
      fileContext = `
📁 CON DOCUMENTI VISIVI: L'utente ha caricato ${hasPlanimetria ? 'planimetria' : ''}${hasPlanimetria && hasFoto ? ' e ' : ''}${hasFoto ? `${leadData.foto_urls.length} foto` : ''}.
- Analizza attentamente i documenti visivi
- Fai riferimento a ciò che vedi: "Dalla planimetria vedo che il bagno è 8mq, confermi?"
- CHIEDI comunque dettagli su stato e desiderata: "Cosa vuoi cambiare in questo ambiente?"
`;
    } else {
      fileContext = `
📁 DOCUMENTI OPZIONALI: L'utente può caricare foto/planimetria ma non è obbligatorio.
- Se ha documenti, suggerisci gentilmente: "Se hai foto o planimetria, aiutano molto"
- Se non li ha, CHIEDI dettagli approfonditi su ogni ambiente
- Procedi sempre con l'intervista, documenti o meno
`;
    }

    // Build scope context
    let scopeContext = '';
    if (renovationScope === 'partial' && targetRooms.length > 0) {
      scopeContext = `
🎯 SCOPE RILEVATO: Ristrutturazione PARZIALE
- Ambienti target: ${targetRooms.join(', ')}
- CONCENTRATI SOLO su questi ambienti nelle tue domande
- NON chiedere informazioni su altri ambienti dell'immobile
`;
    } else if (renovationScope === 'full') {
      scopeContext = `
🎯 SCOPE RILEVATO: Ristrutturazione COMPLETA
- Raccogli informazioni su TUTTI gli ambienti
- Chiedi dettagli per ogni stanza sistematicamente
`;
    } else {
      scopeContext = `
🎯 SCOPE: Da determinare
- CHIEDI come seconda domanda: "Vuoi ristrutturare l'intera casa o solo alcuni ambienti specifici?"
- In base alla risposta, adatta tutte le domande successive
`;
    }

    // Fix #2: Professional System Prompt con flussi strutturati
    let systemPrompt = `Sei un consulente AI specializzato in ristrutturazioni edilizie. [v3.0.0-universal]

🎯 OBIETTIVO: Condurre un'intervista professionale per raccogliere TUTTI i dettagli necessari a un capitolato tecnico accurato.

📋 FLUSSO INTERVISTA:

1️⃣ LOCATION (OBBLIGATORIO):
   "In quale città e CAP si trova l'immobile?" (es: Milano, 20100)

2️⃣ SCOPE - Determina subito se COMPLETA o PARZIALE:
   "Vuoi ristrutturare l'intera casa o solo alcuni ambienti specifici?"
   
   ↓ SE RISPONDE "TUTTA LA CASA" / "COMPLETA" → FLUSSO COMPLETO
   ↓ SE RISPONDE "SOLO BAGNO/CUCINA/..." → FLUSSO PARZIALE

═══════════════════════════════════════════════
📐 FLUSSO COMPLETO (intera casa):
═══════════════════════════════════════════════
3️⃣ "Quanti mq totali ha la casa?"
4️⃣ "Quante camere da letto ci sono?" → "Dimensioni orientative?"
5️⃣ "Soggiorno/sala? Dimensioni?"
6️⃣ "Quanti bagni?" → "Dimensioni di ciascuno?"
7️⃣ "Cucina? Dimensioni?" → "Vuoi cambiare layout?"
8️⃣ "Ci sono terrazzi, balconi, corridoi?"
9️⃣ "Vuoi rifare anche infissi esterni?"
🔟 "Che lavori servono?"
   • Impianti: "Elettrico e idraulico entrambi?"
   • Pavimenti: "Su tutta la casa?"
   • Demolizioni: "Cambi murature/layout interno?"
1️⃣1️⃣ "Qualità materiali?" (economico/standard/premium)
1️⃣2️⃣ "Budget orientativo?"
1️⃣3️⃣ EMAIL: "Per inviarti il capitolato, qual è la tua email?"

═══════════════════════════════════════════════
🎯 FLUSSO PARZIALE (solo alcuni ambienti):
═══════════════════════════════════════════════
3️⃣ "Quali ambienti specifici?" (bagno, cucina, camera, etc.)
4️⃣ Per OGNI ambiente:
   • "Dimensioni?"
   • "In che stato è attualmente?" (vecchio/recente/da rifare)
   • "Cosa vuoi rifare esattamente?" (sanitari, piastrelle, impianti, etc.)
   • "Cambi il layout o mantieni com'è?"
5️⃣ "Qualità materiali?" (economico/standard/premium)
6️⃣ "Budget orientativo?"
7️⃣ EMAIL: "Per inviarti il capitolato, qual è la tua email?"

═══════════════════════════════════════════════

💬 STILE INTERVISTA:
- UNA domanda alla volta (max 30 parole)
- Tono chiaro, semplice ma competente
- Se risposta generica → chiedi dettagli SUBITO prima di andare avanti
- NON generare preventivi, NON inventare dati

✅ COMPLETAMENTO:
Quando hai raccolto TUTTI i dati (location, scope, dettagli ambienti, email), scrivi:
"Perfetto! Ho tutte le informazioni necessarie. Ora genererò il capitolato tecnico. COMPLETATO"

⚠️ VALIDAZIONE OBBLIGATORIA PRIMA DI COMPLETARE:
- Email presente e valida (xxx@yyy.zzz)
- Location con CITTÀ e CAP a 5 cifre
- Dettagli completi su TUTTI gli ambienti coinvolti
- Se manca QUALCOSA, chiedilo gentilmente prima di completare

${fileContext}

${scopeContext}`;


    // Prepare messages for DeepSeek API
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    console.log('Calling DeepSeek API with messages:', apiMessages);

    // Call DeepSeek API with balanced constraints
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: apiMessages,
        max_tokens: 150, // Limite ristretto per domande brevi (max 30 parole)
        temperature: 0.3, // Lower temperature for more predictable responses
        stop: ['<!--'], // Only stop at completion tag
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DeepSeek API error:', errorData);
      throw new Error(`DeepSeek API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;

    console.log('Raw DeepSeek response:', aiResponse);
    
    // FIX FASE 4: Handle empty or invalid AI responses
    if (!aiResponse || aiResponse.trim() === '') {
      console.error('❌ AI returned empty response, using fallback');
      aiResponse = "Mi scusi, ho avuto un problema tecnico. Per favore, può ripetere la sua ultima risposta?";
    }
    
    // MINIMAL SAFETY CHECK: Only prevent extreme inappropriate responses
    const shouldForceComplete = 
      aiResponse.length > 1000 && 
      /preventivo\s+vincolante|€\s*\d+[\d.,]*\s*-\s*€\s*\d+[\d.,]*/.test(aiResponse);
    
    if (shouldForceComplete) {
      console.warn('⚠️  Response too detailed, forcing completion');
      aiResponse = "Perfetto! Ho tutte le informazioni. Procedo con il capitolato.";
      aiResponse += '\n<!--INTERVIEW_COMPLETE:{"status":"force_completed","reason":"safety_trigger"}-->';
    }

    console.log('Processed AI response:', aiResponse);

    // FASE 1: Check multiple completion signals
    const responseText = aiResponse.trim();
    const responseLower = responseText.toLowerCase();
    
    // Primary completion check
    const isComplete = responseText.includes('COMPLETATO') || 
                      responseText.includes('<!--INTERVIEW_COMPLETE-->') || 
                      responseText.includes('INTERVIEW_COMPLETE');
    
    console.log('🔍 Completion check:', { 
      hasCompletato: responseText.includes('COMPLETATO'),
      hasTag: responseText.includes('<!--INTERVIEW_COMPLETE-->'),
      responsePreview: responseText.substring(0, 100)
    });

    console.log('Checking interview completion:', { isComplete });

    // ALWAYS analyze conversation for scope detection (not just when complete)
    const conversationOriginal = messages.map((m: any) => m.content).join(' ');
    const conversationText = conversationOriginal.toLowerCase();
    let detectedRenovationScope = 'unknown';
    let detectedTargetRooms: string[] = [];
    let isMicroIntervention = false;
    
    // Extract email from conversation
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emailMatches = conversationOriginal.match(emailRegex);
    const detectedEmail = emailMatches ? emailMatches[emailMatches.length - 1] : null;
    
    // Extract location using helper function (v2.0.0 - scope fixed)
    const { citta: detectedCitta, cap: detectedCap } = extractLocationFromUserMessages(messages);
    
    // Extract nome and cognome from conversation
    const nomeMatch = conversationOriginal.match(/(?:nome|mi chiamo|sono)\s*[:\s]+([A-ZÀÈÉÌÒÙ][a-zàèéìòù]+)/i);
    const cognomeMatch = conversationOriginal.match(/cognome\s*[:\s]+([A-ZÀÈÉÌÒÙ][a-zàèéìòù]+)/i);
    const detectedNome = nomeMatch?.[1]?.trim() || null;
    const detectedCognome = cognomeMatch?.[1]?.trim() || null;
    
    console.log('🗺️ Location extracted:', { 
      detectedCitta, 
      detectedCap, 
      regione: mapCapToRegione(detectedCap),
      normalized: detectedCitta ? `✅ "${detectedCitta}"` : '❌ not found'
    });
    console.log('👤 Contact extracted:', { detectedNome, detectedCognome, detectedEmail });

    // Fix #1: Robust Scope Detection - Prioritize explicit user intent
    const userSaidFull = /tutta la casa|intera casa|ristrutturazione completa|casa completa|tutto l'immobile|intero appartamento/i.test(conversationText);
    const userSaidPartial = /solo (bagno|cucina|camera)|parziale/i.test(conversationText);
    
    const partialKeywords = [
      'solo bagno', 'solo cucina', 'solo intonaco', 'solo pittura', 'solo soffitto',
      'tetto del bagno', 'soffitto del bagno', 'un bagno', 'rifare il soffitto',
      '6mq', '6 mq', 'piccola riparazione', 'intonacatura'
    ];
    
    const hasPartialKeywords = partialKeywords.some(kw => conversationText.includes(kw));
    
    // PRIORITÀ 1: Se user dice esplicitamente "tutta la casa" → FULL
    if (userSaidFull && !userSaidPartial) {
      detectedRenovationScope = 'full';
      detectedTargetRooms = []; // Reset rooms per full renovation
      console.log('🏠 Detected FULL HOUSE renovation from explicit user intent');
    } 
    // PRIORITÀ 2: Se user dice "solo bagno/cucina" O micro-keywords → PARTIAL
    else if (hasPartialKeywords || userSaidPartial) {
      detectedRenovationScope = 'partial';
      console.log('🔍 Detected PARTIAL scope from conversation');
      
      // Extract room
      if (conversationText.includes('bagno')) detectedTargetRooms.push('bagno');
      if (conversationText.includes('cucina')) detectedTargetRooms.push('cucina');
      if (conversationText.includes('camera')) detectedTargetRooms.push('camera');
      
      // Detect micro-intervention (very small job)
      if (conversationText.includes('solo intonaco') || 
          conversationText.includes('solo pittura') ||
          conversationText.includes('tetto') || 
          conversationText.includes('soffitto')) {
        isMicroIntervention = true;
        console.log('🎯 Detected MICRO-INTERVENTION');
      }
    }

    console.log('Final scope analysis:', { detectedRenovationScope, detectedTargetRooms, isMicroIntervention });

    // FASE 2: Multi-Level Fallback System (CASE-INSENSITIVE)
    const conversationLower = conversationText.toLowerCase();
    const lastUserMessage = (messages[messages.length - 1]?.content || '').toLowerCase();
    const messageCount = messages.length;
    
    // Fallback Level 1: AI explicitly signals completion
    const hasCompletionPhrase = conversationLower.includes('tutte le informazioni') || 
                                 conversationLower.includes('ho tutte le informazioni') ||
                                 conversationLower.includes('completato');
    
    // Fallback Level 2: User says "no" to budget question (last question)
    const userRefusedBudget = (lastUserMessage === 'no' || lastUserMessage === 'no grazie') && 
                               conversationLower.includes('budget');
    
    // Interview status logging
    console.log('📊 Interview Status:', {
      messageCount,
      hasEmail: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(conversationOriginal),
      hasCityCAP: !!(detectedCitta && detectedCap),
      hasScope: detectedRenovationScope !== 'unknown',
      isMarkedComplete: isComplete
    });
    
    console.log('🔍 Fallback analysis:', {
      hasCompletionPhrase,
      userRefusedBudget,
      messageCount,
      detectedScope: detectedRenovationScope
    });
    
    // ====== PRE-COMPLETION VALIDATION (CRITICAL) ======
    const hasValidLocation = detectedCap && detectedCitta;
    const hasValidEmail = detectedEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(detectedEmail);
    
    // If AI wants to complete but essential data is missing, force re-prompt
    if ((isComplete || hasCompletionPhrase) && (!hasValidEmail || !hasValidLocation)) {
      const missingInfo = [];
      if (!hasValidEmail) missingInfo.push('email');
      if (!hasValidLocation) missingInfo.push('città e CAP (es: Milano, 20100)');
      
      console.log('⚠️ Blocking completion - missing data:', missingInfo);
      
      return new Response(JSON.stringify({
        response: `Prima di procedere, ho bisogno ancora di: ${missingInfo.join(' e ')}. Puoi fornirmeli?`,
        interview_complete: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // If AI says complete AND we have essential data, mark as complete
    if ((isComplete || hasCompletionPhrase) && hasValidEmail && hasValidLocation) {
      console.log('✅ INTERVIEW VALIDATED AND COMPLETED');
      
      // Update the lead in database - SAVE TO DEDICATED COLUMNS ✅
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          status: 'interview_completed',
          citta: detectedCitta,                    // ✅ CRITICO: Salva in colonna dedicata
          cap: detectedCap,                        // ✅ CRITICO: Salva in colonna dedicata
          regione: mapCapToRegione(detectedCap),   // ✅ CRITICO: Salva in colonna dedicata
          interview_data: {
            nome: detectedNome,
            cognome: detectedCognome,
            email: detectedEmail,
            location: `${detectedCitta}, ${detectedCap}`,
            citta: detectedCitta,
            cap: detectedCap,
            regione: mapCapToRegione(detectedCap),
            renovation_scope: detectedRenovationScope,
            target_rooms: detectedTargetRooms,
            is_micro_intervention: isMicroIntervention,
            conversation: messages
          }
        })
        .eq('id', leadId);

      if (updateError) {
        console.error('Error updating lead:', updateError);
      }

      return new Response(JSON.stringify({
        response: aiResponse.replace('COMPLETATO', '').trim(),
        interview_complete: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Not complete yet - return AI response
    return new Response(JSON.stringify({
      response: aiResponse,
      interview_complete: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error in ai-interview-v2 function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: 'Mi scusi, si è verificato un errore. Può ripetere l\'ultima risposta?',
      interview_complete: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
