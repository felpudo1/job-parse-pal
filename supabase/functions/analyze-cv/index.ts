import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cvText, action = 'extract' } = await req.json();

    if (!cvText) {
      return new Response(
        JSON.stringify({ error: 'CV text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let prompt = '';
    let systemContent = '';
    
    if (action === 'extract') {
      systemContent = 'Eres un experto en análisis de CVs. Extrae la información de manera precisa y devuelve solo JSON válido sin texto adicional.';
      prompt = `
      Analiza el siguiente CV y extrae la información en formato JSON. 
      Incluye solo los campos que encuentres con información válida.
      
      Formato esperado:
      {
        "nombre": "string",
        "apellidos": "string", 
        "fechaNacimiento": "YYYY-MM-DD",
        "telefono": "string",
        "email": "string",
        "direccion": "string",
        "nacionalidad": "string",
        "experienciaLaboral": [
          {
            "empresa": "string",
            "puesto": "string",
            "fechaInicio": "YYYY-MM-DD",
            "fechaFin": "YYYY-MM-DD",
            "descripcion": "string"
          }
        ],
        "educacion": [
          {
            "institucion": "string",
            "titulo": "string",
            "fechaInicio": "YYYY-MM-DD",
            "fechaFin": "YYYY-MM-DD"
          }
        ],
        "habilidades": ["string"],
        "idiomas": [
          {
            "idioma": "string",
            "nivel": "string"
          }
        ]
      }

      CV a analizar:
      ${cvText}
      `;
    } else if (action === 'analyze') {
      systemContent = 'Eres un experto en recursos humanos y análisis de CV. Proporciona análisis profesionales y constructivos.';
      prompt = `
      Analiza el siguiente CV y genera un análisis completo en formato JSON:
      
      {
        "fortalezas": ["Lista de fortalezas del candidato"],
        "debilidades": ["Áreas de mejora identificadas"],
        "recomendaciones": ["Recomendaciones específicas para mejorar el CV"],
        "puntuacion": {
          "general": number (1-10),
          "experiencia": number (1-10),
          "educacion": number (1-10),
          "habilidades": number (1-10)
        },
        "resumen": "Resumen ejecutivo del perfil profesional del candidato"
      }
      
      Datos del CV:
      ${cvText}
      `;
    }

    console.log('Sending request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: systemContent
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    const raw = data.choices?.[0]?.message?.content ?? '';

    // Normalize to raw JSON (strip code fences and extract the JSON object)
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
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', raw);
      throw new Error('Invalid JSON response from AI');
    }

    const responseData = action === 'extract' 
      ? { success: true, data: parsedData }
      : { success: true, analysis: parsedData };

    return new Response(
      JSON.stringify(responseData), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-cv function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});