import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fallback prompts si no hay nada en DB (compatibilidad)
const FALLBACK = {
  extract: {
    system: 'Eres un experto en análisis de CVs. Devuelve solo JSON válido sin texto adicional.',
    user: 'Extrae los datos del CV en JSON. CV:\n{{cvText}}',
    temperature: 0.2,
  },
  analyze: {
    system: 'Eres experto en RRHH. Devuelve solo JSON válido.',
    user: 'Analiza el CV y devuelve JSON con fortalezas, debilidades, recomendaciones, puntuacion y resumen.\nDatos:\n{{cvText}}',
    temperature: 0.5,
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cvText, action = 'extract', llm = 'gemini' } = await req.json();

    if (!cvText) {
      return new Response(
        JSON.stringify({ error: 'CV text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cargar prompt activo desde DB
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: tpl } = await supabase
      .from('prompt_templates')
      .select('system_content, user_template, temperature')
      .eq('action', action)
      .eq('llm', llm)
      .eq('is_active', true)
      .maybeSingle();

    const systemContent = tpl?.system_content ?? FALLBACK[action as 'extract' | 'analyze'].system;
    const userTemplate = tpl?.user_template ?? FALLBACK[action as 'extract' | 'analyze'].user;
    const temperature = tpl?.temperature ?? FALLBACK[action as 'extract' | 'analyze'].temperature;
    const prompt = userTemplate.replace(/\{\{cvText\}\}/g, cvText);

    console.log(`Sending request to ${llm} (action=${action}, temp=${temperature}, fromDB=${!!tpl})`);

    let response;
    if (llm === 'perplexity') {
      response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${perplexityApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            { role: 'system', content: systemContent },
            { role: 'user', content: prompt }
          ],
          temperature,
        }),
      });
    } else {
      response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemContent },
            { role: 'user', content: prompt }
          ],
          temperature,
          stream: false,
        }),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      if (response.status === 429) throw new Error('Rate limit exceeded. Please try again later.');
      if (response.status === 402) throw new Error('Payment required. Please add credits to your workspace.');
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? '';

    let cleaned = raw.trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .replace(/```/g, '')
      .trim();
    const braceMatch = cleaned.match(/\{[\s\S]*\}/);
    if (braceMatch) cleaned = braceMatch[0];

    let parsedData;
    try {
      parsedData = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse AI response as JSON:', raw);
      throw new Error('Invalid JSON response from AI');
    }

    const responseData = action === 'extract'
      ? { success: true, data: parsedData }
      : { success: true, analysis: parsedData };

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-cv function:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
