-- Enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Tabla user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Función has_role (security definer evita recursión)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Políticas user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tabla prompt_templates
CREATE TABLE public.prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('extract', 'analyze')),
  llm TEXT NOT NULL CHECK (llm IN ('gemini', 'perplexity')),
  system_content TEXT NOT NULL,
  user_template TEXT NOT NULL,
  temperature NUMERIC(3,2) NOT NULL DEFAULT 0.2,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (action, llm, is_active) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view prompt templates"
  ON public.prompt_templates FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert prompt templates"
  ON public.prompt_templates FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update prompt templates"
  ON public.prompt_templates FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete prompt templates"
  ON public.prompt_templates FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
CREATE TRIGGER set_prompt_templates_updated_at
  BEFORE UPDATE ON public.prompt_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Seeds: prompts mejorados por defecto
INSERT INTO public.prompt_templates (name, action, llm, system_content, user_template, temperature) VALUES
('Extract default - Gemini', 'extract', 'gemini',
'Eres un experto extractor de datos de CVs. Devuelve EXCLUSIVAMENTE un objeto JSON válido sin texto adicional, sin markdown, sin comentarios. Reglas estrictas: 1) NUNCA inventes datos. Si un campo no está, omítelo. 2) Fechas en formato ISO YYYY-MM-DD; si solo hay año usa YYYY-01-01. 3) Calcula edad a partir de fechaNacimiento si está disponible. 4) Normaliza teléfonos con código de país cuando sea posible. 5) Habilidades: una por elemento, sin descripciones largas.',
'Analiza el siguiente CV y extrae la información en este JSON exacto (omite campos sin datos):
{
  "nombre":"string","apellidos":"string","fechaNacimiento":"YYYY-MM-DD","edad":number,
  "telefono":"string","email":"string","direccion":"string","nacionalidad":"string",
  "experienciaLaboral":[{"empresa":"string","puesto":"string","fechaInicio":"YYYY-MM-DD","fechaFin":"YYYY-MM-DD","descripcion":"string"}],
  "educacion":[{"institucion":"string","titulo":"string","fechaInicio":"YYYY-MM-DD","fechaFin":"YYYY-MM-DD"}],
  "habilidades":["string"],
  "idiomas":[{"idioma":"string","nivel":"string"}]
}

CV:
{{cvText}}', 0.2),

('Analyze default - Gemini', 'analyze', 'gemini',
'Eres un consultor senior de RRHH. Analizas CVs de forma constructiva, específica y profesional. Devuelve EXCLUSIVAMENTE JSON válido sin markdown ni texto adicional. Tus puntuaciones deben ser realistas (no infles ni hundas). Las recomendaciones deben ser accionables y concretas.',
'Analiza el siguiente CV y devuelve este JSON exacto:
{
  "fortalezas":["..."],
  "debilidades":["..."],
  "recomendaciones":["..."],
  "puntuacion":{"general":1-10,"experiencia":1-10,"educacion":1-10,"habilidades":1-10},
  "resumen":"resumen ejecutivo del perfil"
}

Datos del CV:
{{cvText}}', 0.5),

('Extract default - Perplexity', 'extract', 'perplexity',
'Eres un experto extractor de datos de CVs. Devuelve EXCLUSIVAMENTE un objeto JSON válido sin texto adicional, sin markdown. Reglas: NUNCA inventes datos; omite campos faltantes; fechas ISO YYYY-MM-DD.',
'Extrae la información del siguiente CV en este JSON (omite campos sin datos):
{
  "nombre":"string","apellidos":"string","fechaNacimiento":"YYYY-MM-DD","edad":number,
  "telefono":"string","email":"string","direccion":"string","nacionalidad":"string",
  "experienciaLaboral":[{"empresa":"string","puesto":"string","fechaInicio":"YYYY-MM-DD","fechaFin":"YYYY-MM-DD","descripcion":"string"}],
  "educacion":[{"institucion":"string","titulo":"string","fechaInicio":"YYYY-MM-DD","fechaFin":"YYYY-MM-DD"}],
  "habilidades":["string"],
  "idiomas":[{"idioma":"string","nivel":"string"}]
}

CV:
{{cvText}}', 0.2),

('Analyze default - Perplexity', 'analyze', 'perplexity',
'Eres un consultor senior de RRHH. Devuelve EXCLUSIVAMENTE JSON válido sin markdown.',
'Analiza este CV y devuelve:
{
  "fortalezas":["..."],"debilidades":["..."],"recomendaciones":["..."],
  "puntuacion":{"general":1-10,"experiencia":1-10,"educacion":1-10,"habilidades":1-10},
  "resumen":"..."
}

Datos:
{{cvText}}', 0.5);