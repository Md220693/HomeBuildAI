import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContextRequest {
  lead_id: string;
}

const handler = async (req: Request): Promise<Response> => {

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('URL');
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { lead_id }: ContextRequest = await req.json();

    console.log('Building context for lead:', lead_id);

  
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', lead_id)
      .single();

    if (leadError || !lead) {
      throw new Error(`Lead not found: ${leadError?.message}`);
    }

    const { data: settings } = await supabase
      .from('ai_settings')
      .select('*')
      .single();

    const { data: prompts } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('is_active', true);

    const systemPrompts = {
      interview: prompts?.find(p => p.kind === 'system_interview')?.content || '',
      pricing: prompts?.find(p => p.kind === 'system_pricing')?.content || '',
      pdf_template: prompts?.find(p => p.kind === 'user_template_pdf')?.content || ''
    };


    const location = lead.interview_data?.location || lead.user_contact?.city || 'Italia';
    const quality_tier = lead.interview_data?.quality_level || 'standard';
    const urgency = lead.interview_data?.urgency || 'normale';

  
    let pricingContext = null;
    try {
      const pricingResponse = await fetch(`${supabaseUrl}/functions/v1/calc-pricing-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({
          scope_json: lead.scope_json || lead.interview_data,
          geo: location,
          quality_tier: quality_tier,
          urgency: urgency
        })
      });

      if (pricingResponse.ok) {
        pricingContext = await pricingResponse.json();
      }
    } catch (error) {
      console.error('Error getting pricing preview:', error);
    }

    let kbContext: any[] = [];
    if (settings?.use_rag) {
      const { data: kbDocs } = await supabase
        .from('kb_docs')
        .select('title, content_text, tags')
        .limit(settings.max_neighbors || 5);

      if (kbDocs) {
  
        const interviewText = JSON.stringify(lead.interview_data || {}).toLowerCase();
        
        kbContext = kbDocs
          .filter(doc => {

            const docText = (doc.title + ' ' + doc.content_text).toLowerCase();
            const docWords = docText.split(/\s+/);
            
            return docWords.some(word => 
              word.length > 4 && interviewText.includes(word)
            );
          })
          .slice(0, settings.max_neighbors || 3)
          .map(doc => ({
            title: doc.title,
            excerpt: doc.content_text.substring(0, 500),
            tags: doc.tags
          }));
      }
    }

    let historicalContext = null;
    if (settings?.use_storici && pricingContext) {
      const { data: similarQuotes } = await supabase
        .from('vendor_quotes')
        .select('total_eur, scope_json, normalized_lines_json')
        .eq('geo', location)
        .eq('quality_tier', quality_tier)
        .order('created_at', { ascending: false })
        .limit(3);

      if (similarQuotes && similarQuotes.length > 0) {
        historicalContext = {
          similar_projects_count: similarQuotes.length,
          avg_cost: Math.round(similarQuotes.reduce((sum, q) => sum + parseFloat(q.total_eur), 0) / similarQuotes.length),
          price_range: {
            min: Math.min(...similarQuotes.map(q => parseFloat(q.total_eur))),
            max: Math.max(...similarQuotes.map(q => parseFloat(q.total_eur)))
          }
        };
      }
    }

    const context = {
      success: true,
      lead_id: lead_id,
      system_prompts: systemPrompts,
      interview_data: lead.interview_data,
      scope_json: lead.scope_json,
      user_contact: lead.user_contact,
      pricing_preview: pricingContext,
      knowledge_base: kbContext,
      historical_context: historicalContext,
      ai_settings: {
        use_rag: settings?.use_rag || false,
        use_storici: settings?.use_storici || false,
        confidence_threshold: settings?.default_confidence || 75
      },
      context_metadata: {
        generated_at: new Date().toISOString(),
        kb_docs_used: kbContext.length,
        has_pricing_data: !!pricingContext,
        has_historical_data: !!historicalContext
      }
    };

    console.log('Context built successfully:', {
      lead_id,
      kb_docs: kbContext.length,
      has_pricing: !!pricingContext,
      has_historical: !!historicalContext
    });

    return new Response(
      JSON.stringify(context),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in build-context-for-deepseek function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        context_metadata: {
          generated_at: new Date().toISOString(),
          error: true
        }
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);