/**
 * CV Analyzer Service - Servicio reutilizable para análisis de CVs con AI
 * 
 * Este servicio puede ser exportado y usado en cualquier aplicación
 * Soporta múltiples LLMs: Gemini (default) y Perplexity
 * 
 * @author JP - Job Parse Pal
 * @version 1.0.0
 */

// ========================================
// TIPOS / INTERFACES
// ========================================

/**
 * Datos estructurados extraídos de un CV
 */
export interface ExtractedCVData {
  nombre?: string;
  apellidos?: string;
  fechaNacimiento?: string;
  edad?: number;
  telefono?: string;
  email?: string;
  direccion?: string;
  nacionalidad?: string;
  experienciaLaboral?: ExperienciaLaboral[];
  educacion?: Educacion[];
  habilidades?: string[];
  idiomas?: Idioma[];
}

export interface ExperienciaLaboral {
  empresa: string;
  puesto: string;
  fechaInicio: string;
  fechaFin: string;
  descripcion: string;
}

export interface Educacion {
  institucion: string;
  titulo: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface Idioma {
  idioma: string;
  nivel: string;
}

/**
 * Análisis completo de un CV con puntuaciones y recomendaciones
 */
export interface CVAnalysis {
  fortalezas: string[];
  debilidades: string[];
  recomendaciones: string[];
  puntuacion: {
    general: number;
    experiencia: number;
    educacion: number;
    habilidades: number;
  };
  resumen: string;
}

/**
 * Configuración del servicio de análisis
 */
export interface CVAnalyzerConfig {
  apiUrl: string; // URL base de la API (ej: Supabase function)
  apiKey?: string; // API key si se requiere autenticación
  llm?: 'gemini' | 'perplexity'; // LLM a usar
}

/**
 * Opciones para análisis de CV
 */
export interface AnalyzeOptions {
  llm?: 'gemini' | 'perplexity';
  action: 'extract' | 'analyze';
}

// ========================================
// CLASE PRINCIPAL: CVAnalyzer
// ========================================

/**
 * Servicio principal para análisis de CVs con AI
 * 
 * Ejemplo de uso:
 * ```typescript
 * const analyzer = new CVAnalyzer({
 *   apiUrl: 'https://tu-proyecto.supabase.co/functions/v1/analyze-cv',
 *   apiKey: 'tu-api-key',
 *   llm: 'gemini'
 * });
 * 
 * const data = await analyzer.extractData(cvText);
 * const analysis = await analyzer.analyzeCV(data);
 * ```
 */
export class CVAnalyzer {
  private config: CVAnalyzerConfig;

  constructor(config: CVAnalyzerConfig) {
    this.config = {
      llm: 'gemini',
      ...config
    };
  }

  /**
   * Extrae datos estructurados de un CV (texto plano)
   * 
   * @param cvText - Texto extraído del CV
   * @param llm - LLM a usar (opcional, usa el configurado por defecto)
   * @returns Datos estructurados del CV
   */
  async extractData(
    cvText: string, 
    llm?: 'gemini' | 'perplexity'
  ): Promise<ExtractedCVData> {
    const response = await this.callAPI({
      cvText,
      action: 'extract',
      llm: llm || this.config.llm
    });

    if (!response.success) {
      throw new Error(response.error || 'Error al extraer datos del CV');
    }

    return response.data;
  }

  /**
   * Analiza un CV y genera puntuaciones y recomendaciones
   * 
   * @param cvData - Datos estructurados del CV (de extractData)
   * @param llm - LLM a usar (opcional, usa el configurado por defecto)
   * @returns Análisis completo del CV
   */
  async analyzeCV(
    cvData: ExtractedCVData | string, 
    llm?: 'gemini' | 'perplexity'
  ): Promise<CVAnalysis> {
    const cvText = typeof cvData === 'string' 
      ? cvData 
      : JSON.stringify(cvData);

    const response = await this.callAPI({
      cvText,
      action: 'analyze',
      llm: llm || this.config.llm
    });

    if (!response.success) {
      throw new Error(response.error || 'Error al analizar el CV');
    }

    return response.analysis;
  }

  /**
   * Proceso completo: extrae datos Y analiza en un solo paso
   * 
   * @param cvText - Texto extraído del CV
   * @param llm - LLM a usar (opcional)
   * @returns Objeto con datos extraídos y análisis
   */
  async processCV(
    cvText: string,
    llm?: 'gemini' | 'perplexity'
  ): Promise<{ data: ExtractedCVData; analysis: CVAnalysis }> {
    const data = await this.extractData(cvText, llm);
    const analysis = await this.analyzeCV(data, llm);
    
    return { data, analysis };
  }

  /**
   * Llama a la API de análisis (Edge Function)
   * 
   * @private
   * @param body - Payload para enviar a la API
   * @returns Respuesta de la API
   */
  private async callAPI(body: {
    cvText: string;
    action: 'extract' | 'analyze';
    llm?: 'gemini' | 'perplexity';
  }): Promise<any> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Agregar API key si está configurada
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      headers['apikey'] = this.config.apiKey;
    }

    const response = await fetch(this.config.apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Cambia el LLM por defecto
   * 
   * @param llm - Nuevo LLM a usar por defecto
   */
  setLLM(llm: 'gemini' | 'perplexity'): void {
    this.config.llm = llm;
  }

  /**
   * Obtiene la configuración actual
   * 
   * @returns Configuración actual (sin apiKey por seguridad)
   */
  getConfig(): Omit<CVAnalyzerConfig, 'apiKey'> {
    const { apiKey, ...safeConfig } = this.config;
    return safeConfig;
  }
}

// ========================================
// FUNCIONES HELPER STANDALONE
// ========================================

/**
 * Función standalone para extraer datos de un CV
 * Útil para uso sin instanciar la clase
 * 
 * @param apiUrl - URL de la API
 * @param cvText - Texto del CV
 * @param options - Opciones adicionales
 * @returns Datos estructurados del CV
 */
export async function extractCVData(
  apiUrl: string,
  cvText: string,
  options?: { apiKey?: string; llm?: 'gemini' | 'perplexity' }
): Promise<ExtractedCVData> {
  const analyzer = new CVAnalyzer({
    apiUrl,
    apiKey: options?.apiKey,
    llm: options?.llm,
  });

  return await analyzer.extractData(cvText);
}

/**
 * Función standalone para analizar un CV
 * Útil para uso sin instanciar la clase
 * 
 * @param apiUrl - URL de la API
 * @param cvData - Datos del CV o texto
 * @param options - Opciones adicionales
 * @returns Análisis del CV
 */
export async function analyzeCVData(
  apiUrl: string,
  cvData: ExtractedCVData | string,
  options?: { apiKey?: string; llm?: 'gemini' | 'perplexity' }
): Promise<CVAnalysis> {
  const analyzer = new CVAnalyzer({
    apiUrl,
    apiKey: options?.apiKey,
    llm: options?.llm,
  });

  return await analyzer.analyzeCV(cvData);
}

/**
 * Función standalone para proceso completo
 * Útil para uso sin instanciar la clase
 * 
 * @param apiUrl - URL de la API
 * @param cvText - Texto del CV
 * @param options - Opciones adicionales
 * @returns Datos y análisis del CV
 */
export async function processCVComplete(
  apiUrl: string,
  cvText: string,
  options?: { apiKey?: string; llm?: 'gemini' | 'perplexity' }
): Promise<{ data: ExtractedCVData; analysis: CVAnalysis }> {
  const analyzer = new CVAnalyzer({
    apiUrl,
    apiKey: options?.apiKey,
    llm: options?.llm,
  });

  return await analyzer.processCV(cvText);
}

// ========================================
// EXPORT DEFAULT
// ========================================

export default CVAnalyzer;

