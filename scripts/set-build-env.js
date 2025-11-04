/**
 * Script para establecer variables de entorno de build
 * 
 * Este script se ejecuta ANTES del build para capturar:
 * - Hash del commit actual de Git
 * - Fecha y hora del build
 * - Rama de Git actual
 * 
 * Las variables se escriben en un archivo .env.local que Vite lee automáticamente
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

try {
  let commitHash = 'local-dev';
  let gitBranch = 'main';
  
  // Intentar obtener hash del commit actual (corto)
  try {
    commitHash = execSync('git log -1 --format=%h', { encoding: 'utf-8' }).trim();
  } catch {
    // Si git no está disponible, usar variable de entorno de Vercel
    commitHash = process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'vercel-build';
  }
  
  // Obtener fecha y hora actual en formato ISO
  const buildDate = new Date().toISOString();
  
  // Intentar obtener rama actual
  try {
    gitBranch = execSync('git branch --show-current', { encoding: 'utf-8' }).trim() || 'main';
  } catch {
    // Si git no está disponible, usar variable de entorno de Vercel
    gitBranch = process.env.VERCEL_GIT_COMMIT_REF || 'main';
  }
  
  // Contenido del archivo .env.local
  const envContent = `# Auto-generated build variables - Do not edit manually
VITE_COMMIT_HASH=${commitHash}
VITE_BUILD_DATE=${buildDate}
VITE_GIT_BRANCH=${gitBranch}
`;

  // Escribir archivo .env.local en la raíz del proyecto
  const envPath = join(process.cwd(), '.env.local');
  writeFileSync(envPath, envContent, 'utf-8');
  
  console.log('✅ Variables de build establecidas:');
  console.log(`   - Commit: ${commitHash}`);
  console.log(`   - Fecha: ${buildDate}`);
  console.log(`   - Rama: ${gitBranch}`);
  
} catch (error) {
  console.error('❌ Error al establecer variables de build:', error.message);
  
  // Establecer valores por defecto en caso de error
  const fallbackContent = `# Build variables (fallback)
VITE_COMMIT_HASH=vercel-build
VITE_BUILD_DATE=${new Date().toISOString()}
VITE_GIT_BRANCH=main
`;
  
  const envPath = join(process.cwd(), '.env.local');
  writeFileSync(envPath, fallbackContent, 'utf-8');
  
  console.log('⚠️ Usando valores por defecto para variables de build');
}

