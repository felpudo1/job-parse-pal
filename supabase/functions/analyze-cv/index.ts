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
    const { cvText } = await req.json();

    if (!cvText) {
      return new Response(
        JSON.stringify({ error: 'CV text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `
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
            content: 'Eres un experto en análisis de CVs. Extrae la información de manera precisa y devuelve solo JSON válido sin texto adicional.' 
          },
          { role: 'user', content: prompt }
        ],
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
    
    const extractedData = data.choices[0].message.content;
    
    // Try to parse the JSON response
    let parsedData;
    try {
      parsedData = JSON.parse(extractedData);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', extractedData);
      throw new Error('Invalid JSON response from AI');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: parsedData 
      }), 
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