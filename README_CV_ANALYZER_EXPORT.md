# 🚀 CV Analyzer Service - Guía de Exportación

## 📋 Resumen

Has creado un **servicio reutilizable de análisis de CVs con AI** que puede ser exportado y usado en cualquier aplicación.

---

## 📦 Archivos Creados

### 1. **Servicio Principal**
```
src/services/cvAnalyzer.ts
```
- ✅ Clase `CVAnalyzer` con métodos completos
- ✅ Funciones standalone para uso rápido
- ✅ TypeScript con tipos exportables
- ✅ Comentarios JSDoc completos

### 2. **Edge Function (Backend)**
```
supabase/functions/analyze-cv/index.ts
```
- ✅ Procesa CVs con AI (Gemini o Perplexity)
- ✅ 2 acciones: `extract` y `analyze`
- ✅ CORS configurado
- ✅ Manejo de errores robusto

### 3. **Documentación**
```
docs/CV_ANALYZER_SERVICE.md
```
- ✅ Guía completa de uso
- ✅ Ejemplos en React, Node.js, Python, cURL
- ✅ Configuración de seguridad
- ✅ API reference completa

### 4. **Ejemplos**
```
examples/cv-analyzer-examples.ts
```
- ✅ 7 ejemplos prácticos de uso
- ✅ Comparación de LLMs
- ✅ Procesamiento batch
- ✅ Manejo de errores

---

## 🎯 Cómo Funciona

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│   Frontend  │─────>│  Edge Function   │─────>│     AI      │
│  (React)    │      │   (Supabase)     │      │(Gemini/PPX) │
└─────────────┘      └──────────────────┘      └─────────────┘
      ↓                       ↓                        ↓
   Archivo              Texto del CV            JSON Estructurado
 (PDF/DOCX/TXT)        (extractTextFromFile)        (AI Response)
```

**Flujo:**
1. Frontend extrae texto del archivo (PDF, DOCX, TXT)
2. Envía texto a Edge Function
3. Edge Function llama a AI (Gemini o Perplexity)
4. AI devuelve JSON estructurado
5. Frontend muestra datos o análisis

---

## 📖 Uso Rápido

### Opción A: Clase (Recomendado)

```typescript
import CVAnalyzer from '@/services/cvAnalyzer';

const analyzer = new CVAnalyzer({
  apiUrl: 'https://tu-proyecto.supabase.co/functions/v1/analyze-cv',
  apiKey: 'tu-api-key',
  llm: 'gemini'
});

const { data, analysis } = await analyzer.processCV(cvText);
console.log(data.nombre); // "Juan Pérez"
console.log(analysis.puntuacion.general); // 8
```

### Opción B: Funciones Standalone

```typescript
import { processCVComplete } from '@/services/cvAnalyzer';

const result = await processCVComplete(
  'https://tu-proyecto.supabase.co/functions/v1/analyze-cv',
  cvText,
  { apiKey: 'tu-api-key', llm: 'gemini' }
);
```

---

## 🔧 Para Exportar a Otra App

### 1. Copiar Archivos

**Backend (Edge Function):**
```bash
# Copiar la edge function
cp -r supabase/functions/analyze-cv/ tu-proyecto/supabase/functions/

# Deploy
supabase functions deploy analyze-cv

# Configurar secrets
supabase secrets set LOVABLE_API_KEY=tu_key
supabase secrets set PERPLEXITY_API_KEY=tu_key  # opcional
```

**Frontend (Servicio):**
```bash
# Copiar el servicio
cp src/services/cvAnalyzer.ts tu-proyecto/src/services/
```

### 2. Configurar Variables de Entorno

**Tu proyecto:**
```bash
# .env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

### 3. Usar en tu Código

```typescript
// En cualquier componente o servicio
import CVAnalyzer from '@/services/cvAnalyzer';

const analyzer = new CVAnalyzer({
  apiUrl: import.meta.env.VITE_SUPABASE_URL + '/functions/v1/analyze-cv',
  apiKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
});

const result = await analyzer.processCV(cvText);
```

---

## 🌍 Compatibilidad

✅ **Frontend:**
- React / Next.js / Remix
- Vue / Nuxt
- Angular
- Svelte / SvelteKit
- Vanilla JavaScript

✅ **Backend:**
- Node.js / Express
- Deno
- Bun
- Python (adaptable)
- PHP (adaptable)

✅ **Móvil:**
- React Native
- Capacitor
- Cordova

---

## 📊 Datos Extraídos

El servicio extrae automáticamente:

```typescript
{
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  direccion: string;
  nacionalidad: string;
  fechaNacimiento: string;
  edad: number;
  experienciaLaboral: [
    {
      empresa: string;
      puesto: string;
      fechaInicio: string;
      fechaFin: string;
      descripcion: string;
    }
  ];
  educacion: [
    {
      institucion: string;
      titulo: string;
      fechaInicio: string;
      fechaFin: string;
    }
  ];
  habilidades: string[];
  idiomas: [
    { idioma: string; nivel: string }
  ];
}
```

---

## 📈 Análisis Generado

El servicio analiza y puntúa:

```typescript
{
  fortalezas: string[];              // Puntos fuertes del candidato
  debilidades: string[];             // Áreas de mejora
  recomendaciones: string[];         // Sugerencias para mejorar CV
  puntuacion: {
    general: number;      // 1-10
    experiencia: number;  // 1-10
    educacion: number;    // 1-10
    habilidades: number;  // 1-10
  };
  resumen: string;       // Resumen ejecutivo del perfil
}
```

---

## 💡 Casos de Uso

1. **Plataforma de empleo** - Analizar CVs de candidatos automáticamente
2. **ATS (Applicant Tracking System)** - Filtrar candidatos por puntuación
3. **Servicio de revisión de CVs** - Dar feedback a usuarios
4. **Portal de freelancers** - Validar perfiles
5. **HR Analytics** - Análisis masivo de candidatos
6. **Chatbot de RRHH** - Responder preguntas sobre candidatos

---

## 🔒 Seguridad

⚠️ **IMPORTANTE:**

1. **API Keys en backend:**  
   ```
   ❌ NO: Exponer LOVABLE_API_KEY en frontend
   ✅ SÍ: Usar Supabase Edge Function (backend)
   ```

2. **Autenticación:**
   ```typescript
   // Opcional: Agregar autenticación en Edge Function
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) throw new Error('Unauthorized');
   ```

3. **Rate Limiting:**
   ```typescript
   // Opcional: Implementar rate limiting
   // Limitar a X requests por usuario por día
   ```

---

## 📞 API de la Edge Function

### Endpoint
```
POST https://tu-proyecto.supabase.co/functions/v1/analyze-cv
```

### Headers
```
Content-Type: application/json
apikey: tu-supabase-anon-key
```

### Body
```json
{
  "cvText": "texto del CV...",
  "action": "extract",  // o "analyze"
  "llm": "gemini"       // o "perplexity"
}
```

### Response
```json
{
  "success": true,
  "data": { ... }        // si action=extract
  "analysis": { ... }    // si action=analyze
}
```

---

## 🐛 Troubleshooting

### Error: "Rate limit exceeded"
- Espera unos minutos y reintenta
- Considera implementar caché de resultados

### Error: "Payment required"
- Agrega créditos a tu cuenta de Lovable AI
- O usa Perplexity API

### Error: "Cannot find module"
- Verifica que copiaste el archivo `cvAnalyzer.ts`
- Revisa los paths de import

### Error: "API error: 401"
- Verifica tu API key de Supabase
- Asegúrate de que la Edge Function esté deployed

---

## 📚 Recursos

- **Documentación completa:** `docs/CV_ANALYZER_SERVICE.md`
- **Ejemplos de uso:** `examples/cv-analyzer-examples.ts`
- **Servicio:** `src/services/cvAnalyzer.ts`
- **Edge Function:** `supabase/functions/analyze-cv/index.ts`

---

## ✅ Checklist para Exportar

- [ ] Copiar `cvAnalyzer.ts` a tu proyecto
- [ ] Copiar Edge Function `analyze-cv/`
- [ ] Deploy de Edge Function en Supabase
- [ ] Configurar secrets (LOVABLE_API_KEY, PERPLEXITY_API_KEY)
- [ ] Agregar variables de entorno en tu app
- [ ] Probar con un CV de ejemplo
- [ ] Implementar manejo de errores
- [ ] Agregar rate limiting (opcional)
- [ ] Configurar autenticación (opcional)

---

## 🎉 ¡Listo para Usar!

El servicio está completamente funcional y documentado. Podés:

1. **Usarlo en este proyecto** directamente
2. **Exportarlo a otra app** siguiendo la guía
3. **Modificarlo** según tus necesidades
4. **Escalarlo** con caché, rate limiting, etc.

---

**Desarrollado por JP para Job Parse Pal** 🐓
**Powered by Gemini 2.5 Flash & Perplexity Sonar**

