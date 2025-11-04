/**
 * Ejemplos de uso del CV Analyzer Service
 * Estos ejemplos muestran cómo usar el servicio en diferentes escenarios
 */

import CVAnalyzer, { 
  extractCVData, 
  analyzeCVData, 
  processCVComplete 
} from '../src/services/cvAnalyzer';

// ========================================
// CONFIGURACIÓN
// ========================================

const API_URL = 'https://sblurevkequseuxdbwmj.supabase.co/functions/v1/analyze-cv';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Tu API key

// Texto de ejemplo de un CV
const CV_TEXT_EXAMPLE = `
Juan Carlos Pérez García
Desarrollador Full Stack Senior
Email: juan.perez@email.com
Teléfono: +34 612 345 678
Madrid, España

EXPERIENCIA LABORAL:

Tech Solutions S.L. - Senior Full Stack Developer
Enero 2020 - Actualidad
- Desarrollo de aplicaciones web con React y Node.js
- Liderazgo de equipo de 5 desarrolladores
- Implementación de arquitecturas microservicios
- Mejora de performance en 40%

StartupXYZ - Frontend Developer
Junio 2018 - Diciembre 2019
- Desarrollo de interfaces con React y TypeScript
- Integración con APIs REST
- Testing con Jest y Cypress

EDUCACIÓN:

Universidad Politécnica de Madrid
Ingeniería Informática
2014 - 2018

HABILIDADES:
JavaScript, TypeScript, React, Node.js, Express, MongoDB, PostgreSQL,
Docker, Kubernetes, AWS, Git, Agile/Scrum

IDIOMAS:
- Español: Nativo
- Inglés: Avanzado (C1)
- Francés: Intermedio (B1)
`;

// ========================================
// EJEMPLO 1: Uso básico con clase
// ========================================

export async function ejemplo1_UsoBasico() {
  console.log('🚀 EJEMPLO 1: Uso básico con clase\n');

  // 1. Crear instancia
  const analyzer = new CVAnalyzer({
    apiUrl: API_URL,
    apiKey: API_KEY,
    llm: 'gemini'
  });

  try {
    // 2. Extraer datos
    console.log('📄 Extrayendo datos del CV...');
    const data = await analyzer.extractData(CV_TEXT_EXAMPLE);
    console.log('✅ Datos extraídos:', JSON.stringify(data, null, 2));

    // 3. Analizar CV
    console.log('\n📊 Analizando CV...');
    const analysis = await analyzer.analyzeCV(data);
    console.log('✅ Análisis completo:', JSON.stringify(analysis, null, 2));

    return { data, analysis };
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// ========================================
// EJEMPLO 2: Proceso completo en un paso
// ========================================

export async function ejemplo2_ProcesoCompleto() {
  console.log('🚀 EJEMPLO 2: Proceso completo en un paso\n');

  const analyzer = new CVAnalyzer({
    apiUrl: API_URL,
    apiKey: API_KEY,
  });

  try {
    console.log('⚡ Procesando CV completo...');
    const result = await analyzer.processCV(CV_TEXT_EXAMPLE);
    
    console.log('\n✅ DATOS EXTRAÍDOS:');
    console.log(`Nombre: ${result.data.nombre} ${result.data.apellidos}`);
    console.log(`Email: ${result.data.email}`);
    console.log(`Teléfono: ${result.data.telefono}`);
    console.log(`Experiencias: ${result.data.experienciaLaboral?.length || 0}`);
    console.log(`Educación: ${result.data.educacion?.length || 0}`);
    console.log(`Habilidades: ${result.data.habilidades?.join(', ')}`);

    console.log('\n✅ ANÁLISIS:');
    console.log(`Puntuación General: ${result.analysis.puntuacion.general}/10`);
    console.log(`Experiencia: ${result.analysis.puntuacion.experiencia}/10`);
    console.log(`Educación: ${result.analysis.puntuacion.educacion}/10`);
    console.log(`Habilidades: ${result.analysis.puntuacion.habilidades}/10`);
    console.log(`\nResumen: ${result.analysis.resumen}`);

    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// ========================================
// EJEMPLO 3: Funciones standalone
// ========================================

export async function ejemplo3_FuncionesStandalone() {
  console.log('🚀 EJEMPLO 3: Funciones standalone\n');

  try {
    // Solo extraer datos
    console.log('📄 Extrayendo datos...');
    const data = await extractCVData(API_URL, CV_TEXT_EXAMPLE, { 
      apiKey: API_KEY,
      llm: 'gemini' 
    });
    console.log('✅ Datos extraídos');

    // Solo analizar
    console.log('\n📊 Analizando...');
    const analysis = await analyzeCVData(API_URL, data, { 
      apiKey: API_KEY,
      llm: 'gemini' 
    });
    console.log('✅ Análisis completado');

    return { data, analysis };
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// ========================================
// EJEMPLO 4: Comparar LLMs (Gemini vs Perplexity)
// ========================================

export async function ejemplo4_CompararLLMs() {
  console.log('🚀 EJEMPLO 4: Comparar LLMs\n');

  const analyzer = new CVAnalyzer({
    apiUrl: API_URL,
    apiKey: API_KEY,
  });

  try {
    // Analizar con Gemini
    console.log('🔵 Analizando con Gemini...');
    const geminiStart = Date.now();
    const geminiResult = await analyzer.processCV(CV_TEXT_EXAMPLE, 'gemini');
    const geminiTime = Date.now() - geminiStart;

    // Analizar con Perplexity
    console.log('🟣 Analizando con Perplexity...');
    const perplexityStart = Date.now();
    const perplexityResult = await analyzer.processCV(CV_TEXT_EXAMPLE, 'perplexity');
    const perplexityTime = Date.now() - perplexityStart;

    // Comparar resultados
    console.log('\n📊 COMPARACIÓN:');
    console.log('\n--- Gemini ---');
    console.log(`Tiempo: ${geminiTime}ms`);
    console.log(`Puntuación: ${geminiResult.analysis.puntuacion.general}/10`);
    console.log(`Fortalezas encontradas: ${geminiResult.analysis.fortalezas.length}`);

    console.log('\n--- Perplexity ---');
    console.log(`Tiempo: ${perplexityTime}ms`);
    console.log(`Puntuación: ${perplexityResult.analysis.puntuacion.general}/10`);
    console.log(`Fortalezas encontradas: ${perplexityResult.analysis.fortalezas.length}`);

    return { gemini: geminiResult, perplexity: perplexityResult };
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// ========================================
// EJEMPLO 5: Manejo de errores
// ========================================

export async function ejemplo5_ManejoErrores() {
  console.log('🚀 EJEMPLO 5: Manejo de errores\n');

  const analyzer = new CVAnalyzer({
    apiUrl: API_URL,
    apiKey: 'invalid_key', // API key inválida a propósito
  });

  try {
    await analyzer.processCV(CV_TEXT_EXAMPLE);
  } catch (error) {
    console.log('❌ Error capturado correctamente');
    
    if (error.message.includes('Rate limit')) {
      console.log('⚠️ Límite de uso excedido. Espera unos minutos.');
    } else if (error.message.includes('Payment required')) {
      console.log('💳 Se requiere agregar créditos a la cuenta.');
    } else if (error.message.includes('401') || error.message.includes('403')) {
      console.log('🔒 Error de autenticación. Verifica tu API key.');
    } else {
      console.log('🐛 Error desconocido:', error.message);
    }
  }
}

// ========================================
// EJEMPLO 6: Procesamiento batch (múltiples CVs)
// ========================================

export async function ejemplo6_ProcesamientoBatch() {
  console.log('🚀 EJEMPLO 6: Procesamiento batch\n');

  const cvs = [
    CV_TEXT_EXAMPLE,
    'Otro CV aquí...',
    'Un tercer CV...'
  ];

  const analyzer = new CVAnalyzer({
    apiUrl: API_URL,
    apiKey: API_KEY,
  });

  const results = [];

  for (let i = 0; i < cvs.length; i++) {
    try {
      console.log(`\n📄 Procesando CV ${i + 1}/${cvs.length}...`);
      const result = await analyzer.processCV(cvs[i]);
      results.push({
        index: i,
        success: true,
        data: result
      });
      console.log(`✅ CV ${i + 1} procesado exitosamente`);
    } catch (error) {
      console.error(`❌ Error en CV ${i + 1}:`, error.message);
      results.push({
        index: i,
        success: false,
        error: error.message
      });
    }
  }

  console.log(`\n📊 Resultados: ${results.filter(r => r.success).length}/${cvs.length} exitosos`);
  return results;
}

// ========================================
// EJEMPLO 7: Filtrar candidatos por puntuación
// ========================================

export async function ejemplo7_FiltrarCandidatos() {
  console.log('🚀 EJEMPLO 7: Filtrar candidatos por puntuación\n');

  const analyzer = new CVAnalyzer({
    apiUrl: API_URL,
    apiKey: API_KEY,
  });

  const PUNTUACION_MINIMA = 7;

  try {
    const result = await analyzer.processCV(CV_TEXT_EXAMPLE);
    const puntuacion = result.analysis.puntuacion.general;

    console.log(`📊 Puntuación del candidato: ${puntuacion}/10`);

    if (puntuacion >= PUNTUACION_MINIMA) {
      console.log('✅ CANDIDATO ACEPTADO - Cumple con los requisitos mínimos');
      console.log(`\nFortalezas principales:`);
      result.analysis.fortalezas.slice(0, 3).forEach((f, i) => {
        console.log(`  ${i + 1}. ${f}`);
      });
    } else {
      console.log('❌ CANDIDATO RECHAZADO - No cumple con los requisitos mínimos');
      console.log(`\nÁreas de mejora:`);
      result.analysis.debilidades.slice(0, 3).forEach((d, i) => {
        console.log(`  ${i + 1}. ${d}`);
      });
    }

    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

// ========================================
// FUNCIÓN PRINCIPAL - EJECUTAR EJEMPLOS
// ========================================

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('🐓 CV ANALYZER SERVICE - EJEMPLOS DE USO');
  console.log('═══════════════════════════════════════════\n');

  // Descomentar el ejemplo que quieras ejecutar:

  // await ejemplo1_UsoBasico();
  // await ejemplo2_ProcesoCompleto();
  // await ejemplo3_FuncionesStandalone();
  // await ejemplo4_CompararLLMs();
  // await ejemplo5_ManejoErrores();
  // await ejemplo6_ProcesamientoBatch();
  // await ejemplo7_FiltrarCandidatos();

  console.log('\n✅ Todos los ejemplos completados');
}

// Ejecutar si se corre directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

// Exportar para uso en otros archivos
export {
  CV_TEXT_EXAMPLE,
  API_URL,
};

