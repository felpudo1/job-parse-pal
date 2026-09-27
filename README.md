# 🧠 Job Parse Pal

Aplicación web para **subir, extraer y analizar CVs** con inteligencia artificial. Subí un CV en PDF, DOCX o TXT, elegí el LLM que querés usar y obtené datos estructurados (nombre, edad, contacto, experiencia, educación, habilidades e idiomas) más un análisis completo con fortalezas, debilidades y puntuaciones.

---

## ✨ Funcionalidades

- **Autenticación** — Registro e inicio de sesión con Supabase Auth. Cada usuario guardado ve solo sus propios análisis (RLS).
- **Subida de CV** — Drag & drop con validación de formato (PDF / DOCX / TXT).
- **Extracción de datos** — El texto se extrae en el navegador con `pdfjs-dist` (PDF) y `mammoth` (DOCX).
- **Análisis con IA** — Edge Function que procesa el texto y devuelve JSON estructurado.
- **Selector de LLM** — Elegí entre OpenAI (GPT-4o-mini) o Perplexity (`sonar`) al analizar.
- **Prompts personalizables** — Los administradores pueden editar las plantillas de análisis desde la vista Admin; los usuarios pueden agregar sus propios requerimientos al análisis.
- **Persistencia** — Los análisis de usuarios registrados se guardan en Supabase con sus detalles (experiencias, educación, skills, idiomas). Los invitados pueden analizar sin cuenta.
- **UI moderna** — Tema púrpura con tokens semánticos, componentes Shadcn/ui, responsive (desktop, tablet, mobile).
- **Badge de estado de BD** — Visible solo cuando falla la conexión; al hacer clic muestra info del entorno.

---

## 🛠️ Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript 5.9 + Vite 5 |
| Estilos | Tailwind CSS 3.4 + Shadcn/ui (Radix) + Lucide |
| Estado / datos | TanStack Query (React Query) |
| Formularios | react-hook-form + zod |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions) |
| IA | OpenAI GPT-4o-mini · Perplexity `sonar` · Lovable AI (fallback) |
| Package manager | pnpm 10 |

---

## 🚀 Puesta en marcha

### Requisitos

- Node.js ≥ 18
- pnpm ≥ 9 (`corepack enable` o `npm i -g pnpm`)

### Instalación

```sh
# 1. Clonar el repositorio
git clone <URL_DEL_REPO>
cd job-parse-pal

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env   # o crear .env manualmente (ver sección abajo)

# 4. Levantar el dev server
pnpm dev
```

La app corre en `http://localhost:8080`.

### Variables de entorno

Crear un archivo `.env` en la raíz:

```sh
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
VITE_SUPABASE_PROJECT_ID=<project-id>
```

> ⚠️ Las claves de OpenAI y Perplexity **no** viven en el frontend: se configuran como secretos de la Edge Function (`OPENAI_API_KEY`, `PERPLEXITY_API_KEY`).

---

## 🗄️ Base de datos (Supabase)

Tablas principales (todas con RLS habilitado):

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Perfil de usuario (se crea por trigger al registrarse) |
| `user_roles` | Roles (`admin`, `moderator`, `user`) — separados del perfil por seguridad |
| `cv_analyses` | Un registro por CV analizado, asociado a `user_id` |
| `work_experiences` | Experiencia laboral extraída |
| `education` | Formación académica extraída |
| `skills` | Habilidades extraídas |
| `languages` | Idiomas extraídos |
| `prompt_templates` | Plantillas de prompts editables por administradores |

- **RLS**: cada usuario solo lee/escribe sus propios CVs; los admin tienen acceso completo vía la función `has_role()`.
- Si creás tablas nuevas, recordá los `GRANT` para `authenticated` / `service_role` en la misma migración.

---

## ⚡ Edge Function: `analyze-cv`

Ubicada en `supabase/functions/analyze-cv/`. Flujo:

```
Frontend (extrae texto del archivo)
        │  POST /functions/v1/analyze-cv
        ▼
Edge Function
  ├── Lee la plantilla de prompt activa (prompt_templates)
  ├── Aplica requerimientos personalizados del usuario (si existen)
  ├── Llama al LLM elegido (OpenAI o Perplexity)
  └── Devuelve JSON estructurado
        │
        ▼
Frontend muestra resultados y persiste en Supabase (si hay sesión)
```

Desplegar la función:

```sh
supabase functions deploy analyze-cv
```

---

## 📜 Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Dev server con hot reload (puerto 8080) |
| `pnpm build` | Build de producción |
| `pnpm lint` | Lint con ESLint |
| `pnpm preview` | Servir el build localmente |
| `pnpm summary` | Regenera `SUMMARY.md` con el estado del proyecto |
| `pnpm backup` | Backup completo de la BD |
| `pnpm backup:schema` | Backup solo del esquema |
| `pnpm backup:data` | Backup solo de los datos |

---

## 📁 Estructura del proyecto

```
src/
├── components/
│   ├── ui/              # Componentes base (Shadcn/ui) — genéricos, sin lógica de negocio
│   ├── CVUploadDialog.tsx   # Upload + extracción + análisis + resultados
│   ├── Header.tsx, Hero.tsx, Features.tsx, ...
├── pages/               # Index, Auth, AdminPrompts, NotFound
├── hooks/               # useAuth, use-toast, use-mobile
├── services/
│   ├── cvAnalyzer.ts    # Servicio de análisis (exportable, agnóstico al framework)
│   └── cvStorage.ts     # Persistencia de análisis en Supabase
├── integrations/supabase/  # Cliente y tipos generados
docs/                     # Documentación técnica (CV Analyzer Service, backups)
examples/                 # Ejemplos de uso del servicio de análisis
scripts/                  # Summary automático y backups de BD
supabase/                 # Config y Edge Functions
```

---

## 📤 Exportar el servicio de análisis

El analizador de CVs está desacoplado de la UI y puede reusarse en otro proyecto. Ver:

- [`docs/CV_ANALYZER_SERVICE.md`](docs/CV_ANALYZER_SERVICE.md) — Documentación completa del servicio
- [`examples/cv-analyzer-examples.ts`](examples/cv-analyzer-examples.ts) — 7 ejemplos prácticos
- [`README_CV_ANALYZER_EXPORT.md`](README_CV_ANALYZER_EXPORT.md) — Guía de exportación paso a paso

---

## 🌐 Deploy

- **Lovable**: Share → Publish (hosting integrado).
- **Vercel**: soportado. El proyecto usa `pnpm` (lockfile v9, `packageManager` fijado en `package.json`); Vercel detecta el package manager automáticamente.

---

## 🔐 Seguridad

- Claves de IA solo como secretos de Edge Function, nunca en el frontend.
- Roles en tabla dedicada (`user_roles`), validación server-side con `has_role()`.
- RLS en todas las tablas de usuario; nunca exponer datos cruzados entre usuarios.
- Claves sensibles (API keys, tokens) siempre en variables de entorno o secretos — nunca en el código.
