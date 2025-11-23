/**
 * Script de Backup de Base de Datos
 * 
 * Crea respaldos de la base de datos de Supabase
 * Soporta: estructura, datos, o ambos
 * 
 * Uso:
 * node scripts/backup-database.js [tipo]
 * 
 * Tipos:
 * - schema: Solo estructura
 * - data: Solo datos
 * - full: Estructura + datos (default)
 * 
 * @author JP - Job Parse Pal
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

// ========================================
// CONFIGURACIÓN
// ========================================

const CONFIG = {
  // URL de conexión de Supabase
  // Formato: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
  DB_URL: process.env.DATABASE_URL || 'postgresql://postgres:[PASSWORD]@db.sblurevkequseuxdbwmj.supabase.co:5432/postgres',
  
  // Directorio de backups
  BACKUP_DIR: './backups',
  
  // Tablas a respaldar (dejar vacío para todas)
  TABLES: [
    'cv_analyses',
    // Agregar más tablas aquí
  ],
};

// ========================================
// FUNCIONES HELPER
// ========================================

/**
 * Crea el directorio de backups si no existe
 */
function ensureBackupDir() {
  if (!existsSync(CONFIG.BACKUP_DIR)) {
    mkdirSync(CONFIG.BACKUP_DIR, { recursive: true });
    console.log(`✅ Directorio de backups creado: ${CONFIG.BACKUP_DIR}`);
  }
}

/**
 * Genera nombre de archivo de backup con timestamp
 * 
 * @param {string} type - Tipo de backup (schema, data, full)
 * @returns {string} Nombre del archivo
 */
function getBackupFileName(type) {
  const timestamp = new Date().toISOString()
    .replace(/:/g, '-')
    .replace(/\..+/, '');
  return `backup_${type}_${timestamp}.sql`;
}

/**
 * Verifica si pg_dump está disponible
 */
async function checkPgDump() {
  try {
    await execAsync('pg_dump --version');
    return true;
  } catch {
    return false;
  }
}

// ========================================
// FUNCIONES DE BACKUP
// ========================================

/**
 * Backup usando pg_dump (requiere PostgreSQL instalado)
 * 
 * @param {string} type - Tipo de backup (schema, data, full)
 */
async function backupWithPgDump(type) {
  console.log(`\n🔄 Iniciando backup con pg_dump: ${type}`);
  
  const fileName = getBackupFileName(type);
  const filePath = join(CONFIG.BACKUP_DIR, fileName);
  
  let command = 'pg_dump';
  let args = [`"${CONFIG.DB_URL}"`];
  
  // Configurar según tipo
  if (type === 'schema') {
    args.push('--schema-only');
  } else if (type === 'data') {
    args.push('--data-only');
  }
  // full no necesita flags adicionales
  
  // Agregar tablas específicas si están configuradas
  if (type !== 'schema' && CONFIG.TABLES.length > 0) {
    CONFIG.TABLES.forEach(table => {
      args.push(`--table=${table}`);
    });
  }
  
  args.push(`> "${filePath}"`);
  
  const fullCommand = `${command} ${args.join(' ')}`;
  
  try {
    const { stdout, stderr } = await execAsync(fullCommand, { shell: true });
    
    if (stderr && !stderr.includes('WARNING')) {
      console.error('⚠️ Advertencias:', stderr);
    }
    
    console.log(`✅ Backup completado: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('❌ Error en pg_dump:', error.message);
    throw error;
  }
}

/**
 * Backup usando Supabase client (JavaScript)
 * Útil si no tienes pg_dump instalado
 * 
 * @param {string} type - Tipo de backup (solo 'data' soportado)
 */
async function backupWithSupabase(type) {
  console.log(`\n🔄 Iniciando backup con Supabase client: ${type}`);
  
  if (type !== 'data') {
    console.error('❌ Backup con Supabase client solo soporta tipo "data"');
    return;
  }
  
  // Importar Supabase dinámicamente
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );
  
  const fileName = getBackupFileName('data_supabase');
  const filePath = join(CONFIG.BACKUP_DIR, fileName);
  
  const backupData = {};
  
  // Respaldar cada tabla
  for (const table of CONFIG.TABLES) {
    console.log(`  📄 Respaldando tabla: ${table}`);
    
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*');
      
      if (error) throw error;
      
      backupData[table] = data;
      console.log(`    ✅ ${data.length} registros`);
    } catch (error) {
      console.error(`    ❌ Error en tabla ${table}:`, error.message);
    }
  }
  
  // Guardar como JSON
  writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf-8');
  console.log(`✅ Backup completado: ${filePath}`);
  
  return filePath;
}

/**
 * Backup manual (SQL queries)
 * Genera archivo SQL con INSERT statements
 * 
 * @param {string} type - Tipo de backup
 */
async function backupManual(type) {
  console.log(`\n🔄 Iniciando backup manual: ${type}`);
  
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );
  
  const fileName = getBackupFileName('manual');
  const filePath = join(CONFIG.BACKUP_DIR, fileName);
  
  let sqlContent = `-- Backup manual de Job Parse Pal\n`;
  sqlContent += `-- Fecha: ${new Date().toISOString()}\n`;
  sqlContent += `-- Tipo: ${type}\n\n`;
  
  // Estructura (schema)
  if (type === 'schema' || type === 'full') {
    sqlContent += `-- ========================================\n`;
    sqlContent += `-- ESTRUCTURA\n`;
    sqlContent += `-- ========================================\n\n`;
    sqlContent += `CREATE TABLE IF NOT EXISTS cv_analyses (\n`;
    sqlContent += `  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n`;
    sqlContent += `  created_at TIMESTAMPTZ DEFAULT NOW(),\n`;
    sqlContent += `  cv_data JSONB,\n`;
    sqlContent += `  analysis JSONB,\n`;
    sqlContent += `  user_id UUID\n`;
    sqlContent += `);\n\n`;
  }
  
  // Datos
  if (type === 'data' || type === 'full') {
    sqlContent += `-- ========================================\n`;
    sqlContent += `-- DATOS\n`;
    sqlContent += `-- ========================================\n\n`;
    
    for (const table of CONFIG.TABLES) {
      console.log(`  📄 Respaldando tabla: ${table}`);
      
      const { data, error } = await supabase
        .from(table)
        .select('*');
      
      if (error) {
        console.error(`    ❌ Error:`, error.message);
        continue;
      }
      
      if (data.length === 0) {
        sqlContent += `-- Tabla ${table}: sin datos\n\n`;
        continue;
      }
      
      sqlContent += `-- Tabla: ${table} (${data.length} registros)\n`;
      
      data.forEach(row => {
        const columns = Object.keys(row).join(', ');
        const values = Object.values(row).map(v => {
          if (v === null) return 'NULL';
          if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
          if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
          return v;
        }).join(', ');
        
        sqlContent += `INSERT INTO ${table} (${columns}) VALUES (${values});\n`;
      });
      
      sqlContent += `\n`;
      console.log(`    ✅ ${data.length} registros`);
    }
  }
  
  writeFileSync(filePath, sqlContent, 'utf-8');
  console.log(`✅ Backup completado: ${filePath}`);
  
  return filePath;
}

// ========================================
// FUNCIÓN PRINCIPAL
// ========================================

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('🗄️  BACKUP DE BASE DE DATOS - Job Parse Pal');
  console.log('═══════════════════════════════════════════\n');
  
  // Obtener tipo de backup de argumentos
  const type = process.argv[2] || 'full';
  
  if (!['schema', 'data', 'full'].includes(type)) {
    console.error('❌ Tipo inválido. Usa: schema, data, o full');
    process.exit(1);
  }
  
  console.log(`📋 Tipo de backup: ${type}`);
  console.log(`📁 Directorio: ${CONFIG.BACKUP_DIR}`);
  console.log(`📊 Tablas: ${CONFIG.TABLES.join(', ') || 'todas'}`);
  
  // Crear directorio de backups
  ensureBackupDir();
  
  try {
    // Verificar si pg_dump está disponible
    const hasPgDump = await checkPgDump();
    
    if (hasPgDump) {
      console.log('✅ pg_dump disponible');
      await backupWithPgDump(type);
    } else {
      console.log('⚠️ pg_dump no disponible, usando método alternativo');
      
      if (type === 'schema') {
        console.log('❌ Backup de schema requiere pg_dump');
        console.log('💡 Instala PostgreSQL para usar pg_dump');
        process.exit(1);
      }
      
      await backupManual(type);
    }
    
    console.log('\n✅ Backup completado exitosamente');
  } catch (error) {
    console.error('\n❌ Error en backup:', error.message);
    process.exit(1);
  }
}

// Ejecutar
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('backup-database.js')) {
  main().catch(console.error);
}

export { backupWithPgDump, backupWithSupabase, backupManual };



