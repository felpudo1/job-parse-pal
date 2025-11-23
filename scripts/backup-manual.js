/**
 * Backup manual rápido de la base de datos
 * Sin necesidad de pg_dump ni configuración compleja
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const SUPABASE_URL = "https://sblurevkequseuxdbwmj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNibHVyZXZrZXF1c2V1eGRid21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNzY4OTAsImV4cCI6MjA3NDk1Mjg5MH0.n7-BA-ATcdPCZccSIJwer0bRe8QuN5xEUPCFq3uMlFo";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function backup() {
  console.log('═══════════════════════════════════════════');
  console.log('🗄️  BACKUP DE BASE DE DATOS');
  console.log('═══════════════════════════════════════════\n');

  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const fileName = `backups/backup_completo_${timestamp}.sql`;

  let sql = `-- Backup de Job Parse Pal\n`;
  sql += `-- Fecha: ${new Date().toISOString()}\n`;
  sql += `-- Proyecto: sblurevkequseuxdbwmj\n\n`;

  // Estructura
  sql += `-- ========================================\n`;
  sql += `-- ESTRUCTURA DE LA BASE DE DATOS\n`;
  sql += `-- ========================================\n\n`;
  
  sql += `-- Tabla: cv_analyses\n`;
  sql += `CREATE TABLE IF NOT EXISTS cv_analyses (\n`;
  sql += `  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`;
  sql += `  created_at TIMESTAMPTZ DEFAULT NOW(),\n`;
  sql += `  cv_data JSONB,\n`;
  sql += `  analysis JSONB,\n`;
  sql += `  user_id UUID,\n`;
  sql += `  file_name TEXT,\n`;
  sql += `  file_type TEXT,\n`;
  sql += `  llm_used TEXT DEFAULT 'gemini'\n`;
  sql += `);\n\n`;

  // Datos
  sql += `-- ========================================\n`;
  sql += `-- DATOS\n`;
  sql += `-- ========================================\n\n`;

  console.log('📊 Extrayendo datos de cv_analyses...');
  
  try {
    const { data, error, count } = await supabase
      .from('cv_analyses')
      .select('*', { count: 'exact' });

    if (error) {
      console.error('❌ Error al obtener datos:', error.message);
      throw error;
    }

    console.log(`✅ Encontrados ${count || 0} registros`);

    if (data && data.length > 0) {
      sql += `-- Tabla: cv_analyses (${data.length} registros)\n`;
      
      data.forEach((row, index) => {
        const values = [
          row.id ? `'${row.id}'` : 'NULL',
          row.created_at ? `'${row.created_at}'` : 'NOW()',
          row.cv_data ? `'${JSON.stringify(row.cv_data).replace(/'/g, "''")}'::jsonb` : 'NULL',
          row.analysis ? `'${JSON.stringify(row.analysis).replace(/'/g, "''")}'::jsonb` : 'NULL',
          row.user_id ? `'${row.user_id}'` : 'NULL',
          row.file_name ? `'${row.file_name.replace(/'/g, "''")}'` : 'NULL',
          row.file_type ? `'${row.file_type}'` : 'NULL',
          row.llm_used ? `'${row.llm_used}'` : "'gemini'"
        ];

        sql += `INSERT INTO cv_analyses (id, created_at, cv_data, analysis, user_id, file_name, file_type, llm_used)\n`;
        sql += `VALUES (${values.join(', ')});\n`;
        
        if ((index + 1) % 10 === 0) {
          console.log(`  📝 Procesados ${index + 1}/${data.length} registros`);
        }
      });
      
      sql += `\n`;
    } else {
      sql += `-- Tabla cv_analyses: sin datos\n\n`;
    }

    // Guardar archivo
    writeFileSync(fileName, sql, 'utf-8');
    
    console.log(`\n✅ Backup completado exitosamente`);
    console.log(`📁 Archivo: ${fileName}`);
    console.log(`📦 Tamaño: ${(sql.length / 1024).toFixed(2)} KB`);
    console.log(`📊 Registros: ${data?.length || 0}`);

  } catch (err) {
    console.error('\n❌ Error durante el backup:', err.message);
    throw err;
  }
}

backup().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});



