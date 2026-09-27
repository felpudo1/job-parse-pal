import { supabase } from "@/integrations/supabase/client";

// Convierte fechas libres del LLM a formato YYYY-MM-DD o null
const toDate = (v?: string | null): string | null => {
  if (!v) return null;
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{4}-\d{2}$/.test(s)) return `${s}-01`;
  if (/^\d{4}$/.test(s)) return `${s}-01-01`;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

interface SaveParams {
  userId: string;
  fileName: string;
  fileType: string;
  data: any;
  analysis: any;
}

// Guarda un análisis de CV completo asociado al usuario
export const saveCVAnalysis = async ({ userId, fileName, fileType, data, analysis }: SaveParams) => {
  const { data: row, error } = await supabase
    .from("cv_analyses")
    .insert({
      user_id: userId,
      file_name: fileName,
      file_type: fileType,
      nombre: data?.nombre ?? null,
      apellidos: data?.apellidos ?? null,
      fecha_nacimiento: toDate(data?.fechaNacimiento),
      edad: typeof data?.edad === "number" ? data.edad : null,
      telefono: data?.telefono ?? null,
      email: data?.email ?? null,
      direccion: data?.direccion ?? null,
      nacionalidad: data?.nacionalidad ?? null,
      fortalezas: analysis?.fortalezas ?? null,
      debilidades: analysis?.debilidades ?? null,
      recomendaciones: analysis?.recomendaciones ?? null,
      puntuacion_general: analysis?.puntuacion?.general ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  const id = row.id;

  const inserts = [];
  if (data?.experienciaLaboral?.length)
    inserts.push(supabase.from("work_experiences").insert(
      data.experienciaLaboral.map((w: any) => ({
        cv_analysis_id: id, empresa: w.empresa || "-", puesto: w.puesto || "-",
        fecha_inicio: toDate(w.fechaInicio), fecha_fin: toDate(w.fechaFin), descripcion: w.descripcion ?? null,
      }))));
  if (data?.educacion?.length)
    inserts.push(supabase.from("education").insert(
      data.educacion.map((e: any) => ({
        cv_analysis_id: id, institucion: e.institucion || "-", titulo: e.titulo || "-",
        fecha_inicio: toDate(e.fechaInicio), fecha_fin: toDate(e.fechaFin),
      }))));
  if (data?.habilidades?.length)
    inserts.push(supabase.from("skills").insert(
      data.habilidades.map((s: string) => ({ cv_analysis_id: id, skill: s }))));
  if (data?.idiomas?.length)
    inserts.push(supabase.from("languages").insert(
      data.idiomas.map((l: any) => ({ cv_analysis_id: id, idioma: l.idioma || "-", nivel: l.nivel || "-" }))));

  const results = await Promise.all(inserts);
  const failed = results.find((r) => r.error);
  if (failed?.error) console.error("Error guardando detalle del CV:", failed.error);
  return id;
};
