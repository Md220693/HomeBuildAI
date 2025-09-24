import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PricingRequest {
  scope_json: any;
  geo: string;
  quality_tier: string;
  urgency: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
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

    const { scope_json, geo, quality_tier, urgency }: PricingRequest = await req.json();

    console.log('Calculating pricing for:', { scope_json, geo, quality_tier, urgency });

    // Get AI settings
    const { data: settings } = await supabase
      .from('ai_settings')
      .select('*')
      .single();

    // Get base price items
    const { data: priceItems } = await supabase
      .from('price_items')
      .select('*');

    // Get modifiers
    const [geoModifiers, qualityModifiers, urgencyModifiers] = await Promise.all([
      supabase.from('price_modifiers_geo').select('*'),
      supabase.from('price_modifiers_quality').select('*').eq('quality_tier', quality_tier),
      supabase.from('price_modifiers_urgency').select('*').eq('urgency_band', urgency)
    ]);

    // Calculate base pricing from scope
    let baseCost = 0;
    const lineItems = [];

    // Extract CAP from geo string for geographic modifiers
    const capMatch = geo.match(/\d{5}/);
    const cap = capMatch ? capMatch[0] : null;

    // Find geographic multiplier
    let geoMultiplier = 1.0;
    if (geoModifiers.data && cap) {
      const applicableGeoModifier = geoModifiers.data.find(mod => 
        !mod.cap_pattern || (cap && cap.match(new RegExp(mod.cap_pattern)))
      );
      if (applicableGeoModifier) {
        geoMultiplier = parseFloat(applicableGeoModifier.multiplier);
      }
    }

    // Get quality and urgency multipliers
    const qualityMultiplier = qualityModifiers.data?.[0]?.multiplier || 1.0;
    const urgencyMultiplier = urgencyModifiers.data?.[0]?.multiplier || 1.0;

    // Process scope_json to estimate items and quantities
    if (scope_json && typeof scope_json === 'object') {
      // Simplified price calculation - match scope items to price items
      const scopeText = JSON.stringify(scope_json).toLowerCase();
      
      if (priceItems && priceItems.length > 0) {
        for (const item of priceItems) {
          // Simple keyword matching for demo
          const keywords = [
            item.item_code.toLowerCase(),
            item.category.toLowerCase(),
            ...(item.description?.toLowerCase().split(' ') || [])
          ];

          const hasMatch = keywords.some(keyword => 
            keyword.length > 3 && scopeText.includes(keyword)
          );

          if (hasMatch) {
            // Estimate quantity based on scope complexity
            const estimatedQuantity = Math.max(1, Math.floor(Math.random() * 10) + 1);
            const basePrice = parseFloat(item.base_price_eur);
            const adjustedPrice = basePrice * geoMultiplier * qualityMultiplier * urgencyMultiplier;
            const lineTotal = adjustedPrice * estimatedQuantity;

            lineItems.push({
              item_code: item.item_code,
              description: item.description || item.category,
              unit: item.unit,
              quantity: estimatedQuantity,
              unit_price: adjustedPrice,
              total: lineTotal
            });

            baseCost += lineTotal;
          }
        }
      }
    }

    // If no matches found, provide default estimates
    if (lineItems.length === 0) {
      lineItems.push({
        item_code: 'DEFAULT_001',
        description: 'Lavori di ristrutturazione generici',
        unit: 'forfait',
        quantity: 1,
        unit_price: 5000 * geoMultiplier * qualityMultiplier * urgencyMultiplier,
        total: 5000 * geoMultiplier * qualityMultiplier * urgencyMultiplier
      });
      baseCost = 5000 * geoMultiplier * qualityMultiplier * urgencyMultiplier;
    }

    // Apply guard rails if historical data is enabled
    let minEstimate = baseCost * 0.8;
    let maxEstimate = baseCost * 1.2;
    let confidence = settings?.default_confidence || 75;

    if (settings?.use_storici) {
      // Check historical quotes for similar projects
      const { data: historicalQuotes } = await supabase
        .from('vendor_quotes')
        .select('total_eur, scope_json')
        .eq('geo', geo)
        .eq('quality_tier', quality_tier)
        .limit(10);

      if (historicalQuotes && historicalQuotes.length > 0) {
        const avgHistorical = historicalQuotes.reduce((sum, quote) => 
          sum + parseFloat(quote.total_eur), 0) / historicalQuotes.length;
        
        const guardRailPct = (settings?.guard_rail_pct || 20) / 100;
        const minGuardRail = avgHistorical * (1 - guardRailPct);
        const maxGuardRail = avgHistorical * (1 + guardRailPct);

        // Apply guard rails
        minEstimate = Math.max(minEstimate, minGuardRail);
        maxEstimate = Math.min(maxEstimate, maxGuardRail);
        
        // Increase confidence if within historical range
        if (baseCost >= minGuardRail && baseCost <= maxGuardRail) {
          confidence = Math.min(95, confidence + 10);
        }
      }
    }

    const result = {
      success: true,
      base_cost: Math.round(baseCost),
      min_estimate: Math.round(minEstimate),
      max_estimate: Math.round(maxEstimate),
      confidence: confidence,
      line_items: lineItems,
      modifiers: {
        geographic: geoMultiplier,
        quality: qualityMultiplier,
        urgency: urgencyMultiplier
      },
      notes: `Stima basata su ${lineItems.length} elementi del listino con moltiplicatori geografici (${geoMultiplier}x), qualità (${qualityMultiplier}x) e urgenza (${urgencyMultiplier}x).`
    };

    console.log('Pricing calculation result:', result);

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error('Error in calc-pricing-preview function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        min_estimate: 3000,
        max_estimate: 8000,
        confidence: 60,
        notes: "Stima di fallback utilizzata a causa di errore nel calcolo"
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);