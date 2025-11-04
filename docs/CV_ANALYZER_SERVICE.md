# 📄 CV Analyzer Service - Documentación

Servicio reutilizable para análisis de CVs con AI (Gemini o Perplexity).

---

## 🚀 Instalación en otra app

### Opción 1: Copiar archivo directamente

```bash
# Copiar el servicio a tu proyecto
cp src/services/cvAnalyzer.ts tu-proyecto/src/services/
```

### Opción 2: Copiar Edge Function (Backend)

```bash
# Copiar la edge function de Supabase
cp supabase/functions/analyze-cv/ tu-proyecto/supabase/functions/
```

---

## 📦 Configuración

### 1. Variables de entorno necesarias

**En tu Edge Function (Supabase):**
```bash
LOVABLE_API_KEY=tu_api_key_gemini
PERPLEXITY_API_KEY=tu_api_key_perplexity  # opcional
```

**En tu Frontend:**
```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

### 2. Deploy de Edge Function

```bash
# Si usas Supabase
supabase functions deploy analyze-cv

# Setear secrets
supabase secrets set LOVABLE_API_KEY=tu_key
supabase secrets set PERPLEXITY_API_KEY=tu_key
```

---

## 🎯 Uso Básico

### Ejemplo 1: Uso con Clase (Recomendado)

```typescript
import CVAnalyzer from '@/services/cvAnalyzer';

// 1. Crear instancia del analyzer
const analyzer = new CVAnalyzer({
  apiUrl: 'https://tu-proyecto.supabase.co/functions/v1/analyze-cv',
  apiKey: 'tu-supabase-anon-key',  // opcional si es pública
  llm: 'gemini'  // o 'perplexity'
});

// 2. Extraer datos de un CV
const cvText = "Nombre: Juan Pérez\nExperiencia: 5 años en desarrollo...";
const extractedData = await analyzer.extractData(cvText);

console.log(extractedData);
/*
{
  nombre: "Juan",
  apellidos: "Pérez",
  email: "juan@example.com",
  experienciaLaboral: [...],
  educacion: [...],
  habilidades: ["JavaScript", "React", "Node.js"],
  ...
}
*/

// 3. Analizar el CV
const analysis = await analyzer.analyzeCV(extractedData);

console.log(analysis);
/*
{
  fortalezas: ["Experiencia sólida en frontend", ...],
  debilidades: ["Falta de experiencia en backend", ...],
  recomendaciones: ["Agregar más detalles sobre proyectos", ...],
  puntuacion: {
    general: 8,
    experiencia: 9,
    educacion: 7,
    habilidades: 8
  },
  resumen: "Candidato con fuerte perfil en desarrollo frontend..."
}
*/

// 4. O hacer todo en un paso
const { data, analysis } = await analyzer.processCV(cvText);
```

---

### Ejemplo 2: Funciones Standalone

```typescript
import { extractCVData, analyzeCVData, processCVComplete } from '@/services/cvAnalyzer';

const API_URL = 'https://tu-proyecto.supabase.co/functions/v1/analyze-cv';
const API_KEY = 'tu-supabase-anon-key';

// Solo extraer datos
const data = await extractCVData(API_URL, cvText, { 
  apiKey: API_KEY,
  llm: 'gemini' 
});

// Solo analizar
const analysis = await analyzeCVData(API_URL, data, { 
  apiKey: API_KEY,
  llm: 'perplexity' 
});

// Proceso completo
const result = await processCVComplete(API_URL, cvText, { 
  apiKey: API_KEY 
});
```

---

## 🔄 Integración con React

### Hook personalizado

```typescript
// hooks/useCVAnalyzer.ts
import { useState } from 'react';
import CVAnalyzer, { ExtractedCVData, CVAnalysis } from '@/services/cvAnalyzer';

export const useCVAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const analyzer = new CVAnalyzer({
    apiUrl: import.meta.env.VITE_SUPABASE_URL + '/functions/v1/analyze-cv',
    apiKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  });

  const analyzeCV = async (cvText: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await analyzer.processCV(cvText);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { analyzeCV, loading, error };
};
```

### Uso en componente

```typescript
// components/CVAnalyzer.tsx
import { useCVAnalyzer } from '@/hooks/useCVAnalyzer';

export const CVAnalyzerComponent = () => {
  const { analyzeCV, loading, error } = useCVAnalyzer();
  const [result, setResult] = useState(null);

  const handleAnalyze = async (cvText: string) => {
    const data = await analyzeCV(cvText);
    setResult(data);
  };

  return (
    <div>
      {loading && <p>Analizando...</p>}
      {error && <p>Error: {error}</p>}
      {result && (
        <div>
          <h2>{result.data.nombre} {result.data.apellidos}</h2>
          <p>Puntuación: {result.analysis.puntuacion.general}/10</p>
        </div>
      )}
    </div>
  );
};
```

---

## 🔧 API de la Edge Function

### Endpoint

```
POST https://tu-proyecto.supabase.co/functions/v1/analyze-cv
```

### Request Body

```json
{
  "cvText": "texto del CV...",
  "action": "extract",  // o "analyze"
  "llm": "gemini"  // o "perplexity"
}
```

### Response (action: extract)

```json
{
  "success": true,
  "data": {
    "nombre": "Juan",
    "apellidos": "Pérez",
    "email": "juan@example.com",
    "telefono": "+34 123 456 789",
    "experienciaLaboral": [
      {
        "empresa": "Tech Corp",
        "puesto": "Senior Developer",
        "fechaInicio": "2020-01-01",
        "fechaFin": "2023-12-31",
        "descripcion": "Desarrollo de aplicaciones web"
      }
    ],
    "educacion": [...],
    "habilidades": ["JavaScript", "React", "Node.js"],
    "idiomas": [
      { "idioma": "Español", "nivel": "Nativo" },
      { "idioma": "Inglés", "nivel": "Avanzado" }
    ]
  }
}
```

### Response (action: analyze)

```json
{
  "success": true,
  "analysis": {
    "fortalezas": [
      "Experiencia sólida en desarrollo frontend",
      "Dominio de tecnologías modernas"
    ],
    "debilidades": [
      "Falta de experiencia en backend",
      "CV podría ser más específico en logros"
    ],
    "recomendaciones": [
      "Agregar métricas cuantificables de impacto",
      "Incluir proyectos destacados con links"
    ],
    "puntuacion": {
      "general": 8,
      "experiencia": 9,
      "educacion": 7,
      "habilidades": 8
    },
    "resumen": "Candidato con fuerte perfil técnico..."
  }
}
```

---

## 🌐 Uso en otras tecnologías

### Node.js / Express

```javascript
const CVAnalyzer = require('./services/cvAnalyzer');

const analyzer = new CVAnalyzer({
  apiUrl: process.env.SUPABASE_URL + '/functions/v1/analyze-cv',
  apiKey: process.env.SUPABASE_ANON_KEY,
});

app.post('/api/analyze-cv', async (req, res) => {
  try {
    const { cvText } = req.body;
    const result = await analyzer.processCV(cvText);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Python (requests)

```python
import requests

def analyze_cv(cv_text: str) -> dict:
    response = requests.post(
        'https://tu-proyecto.supabase.co/functions/v1/analyze-cv',
        headers={
            'Content-Type': 'application/json',
            'apikey': 'tu-supabase-anon-key'
        },
        json={
            'cvText': cv_text,
            'action': 'extract',
            'llm': 'gemini'
        }
    )
    return response.json()
```

### cURL

```bash
curl -X POST https://tu-proyecto.supabase.co/functions/v1/analyze-cv \
  -H "Content-Type: application/json" \
  -H "apikey: tu-supabase-anon-key" \
  -d '{
    "cvText": "Nombre: Juan Pérez...",
    "action": "extract",
    "llm": "gemini"
  }'
```

---

## 🎨 Características

✅ **Modular y reutilizable** - Usa en cualquier proyecto  
✅ **TypeScript completo** - Tipos seguros  
✅ **Múltiples LLMs** - Gemini (default) o Perplexity  
✅ **2 Acciones** - Extraer datos o analizar CV  
✅ **Funciones standalone** - No requiere instanciar clase  
✅ **Compatible con cualquier framework** - React, Vue, Node.js, Python, etc.  
✅ **Edge Function** - Backend serverless con Supabase  
✅ **Documentado** - Comentarios JSDoc completos  

---

## 🔒 Seguridad

**⚠️ IMPORTANTE:**

1. **API Keys en backend:** Nunca expongas `LOVABLE_API_KEY` o `PERPLEXITY_API_KEY` en el frontend
2. **Usa Edge Functions:** Las keys deben estar en el servidor (Supabase Edge Function)
3. **Row Level Security:** Si guardas datos en Supabase, configura RLS
4. **Rate Limiting:** Implementa límites de uso para evitar abuso

---

## 📝 Tipos TypeScript

Todos los tipos están exportados desde `cvAnalyzer.ts`:

```typescript
import type { 
  ExtractedCVData,
  CVAnalysis,
  CVAnalyzerConfig,
  ExperienciaLaboral,
  Educacion,
  Idioma
} from '@/services/cvAnalyzer';
```

---

## 🐛 Manejo de Errores

```typescript
try {
  const result = await analyzer.processCV(cvText);
} catch (error) {
  if (error.message.includes('Rate limit')) {
    console.error('Límite de uso excedido');
  } else if (error.message.includes('Payment required')) {
    console.error('Necesitas agregar créditos');
  } else {
    console.error('Error desconocido:', error.message);
  }
}
```

---

## 📚 Referencias

- **Gemini API**: https://ai.google.dev/
- **Perplexity API**: https://docs.perplexity.ai/
- **Supabase Edge Functions**: https://supabase.com/docs/guides/functions

---

## 💡 Ejemplos de Uso Real

Ver carpeta `examples/` para casos de uso completos.

---

**Desarrollado por JP para Job Parse Pal** 🐓

