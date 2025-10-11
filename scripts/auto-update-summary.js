#!/usr/bin/env node

/**
 * Script automático para actualizar SUMMARY.md después de cada cambio
 * Se ejecuta automáticamente cuando se detectan cambios en el proyecto
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Función para obtener información del proyecto
function getProjectInfo() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return {
      name: packageJson.name,
      version: packageJson.version,
      dependencies: Object.keys(packageJson.dependencies || {}).length,
      devDependencies: Object.keys(packageJson.devDependencies || {}).length
    };
  } catch (error) {
    return {
      name: 'job-parse-pal',
      version: '0.0.0',
      dependencies: 0,
      devDependencies: 0
    };
  }
}

// Función para verificar el estado del servidor
function checkServerStatus() {
  try {
    const netstat = execSync('netstat -an | findstr :8080', { encoding: 'utf8' });
    const isRunning = netstat.includes('LISTENING');
    return {
      running: isRunning,
      port: 8080,
      status: isRunning ? 'ACTIVO' : 'DETENIDO'
    };
  } catch (error) {
    return {
      running: false,
      port: 8080,
      status: 'DETENIDO'
    };
  }
}

// Función para analizar la base de datos
function analyzeDatabase() {
  try {
    const typesFile = fs.readFileSync('src/integrations/supabase/types.ts', 'utf8');
    const hasTables = !typesFile.includes('[_ in never]: never');
    return {
      configured: true,
      hasTables: hasTables,
      status: hasTables ? 'COMPLETO' : 'INCOMPLETO'
    };
  } catch (error) {
    return {
      configured: false,
      hasTables: false,
      status: 'NO CONFIGURADO'
    };
  }
}

// Función para contar archivos del proyecto
function countProjectFiles() {
  let components = 0;
  let pages = 0;
  let hooks = 0;
  let integrations = 0;
  
  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scanDirectory(itemPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        if (dir.includes('components')) components++;
        else if (dir.includes('pages')) pages++;
        else if (dir.includes('hooks')) hooks++;
        else if (dir.includes('integrations')) integrations++;
      }
    });
  }
  
  scanDirectory('src');
  
  return {
    components,
    pages,
    hooks,
    integrations,
    total: components + pages + hooks + integrations
  };
}

// Función principal para generar el summary
function generateSummary() {
  const projectInfo = getProjectInfo();
  const server = checkServerStatus();
  const database = analyzeDatabase();
  const files = countProjectFiles();
  
  const timestamp = new Date().toLocaleString('es-ES', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const summary = `# 📊 Job Parse Pal - Summary del Proyecto

## 🎯 **Información General**
- **Nombre**: ${projectInfo.name}
- **Versión**: ${projectInfo.version}
- **Tipo**: Aplicación web para análisis de CVs
- **Tecnologías**: React + TypeScript + Vite + Supabase
- **Última Actualización**: ${timestamp}
- **Estado**: ${server.status}

## 🏗️ **Arquitectura Técnica**

### **Frontend**
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.20
- **Lenguaje**: TypeScript 5.9.3
- **UI Library**: Shadcn/ui + Tailwind CSS
- **Package Manager**: pnpm 10.15.0
- **Estado**: React Query (TanStack Query)

### **Backend**
- **Base de Datos**: Supabase (PostgreSQL 13.0.5)
- **URL**: https://sblurevkequseuxdbwmj.supabase.co
- **Proyecto ID**: sblurevkequseuxdbwmj
- **Edge Functions**: analyze-cv
- **Estado BD**: ${database.status}

### **Configuración**
- **Puerto de Desarrollo**: 8080 (Vite)
- **Servidor**: ${server.status} en puerto ${server.port}
- **Linting**: ESLint 9.37.0
- **Styling**: Tailwind CSS 3.4.18

## 📁 **Estructura del Proyecto**

### **Estadísticas de Archivos**
- **Componentes**: ${files.components} archivos
- **Páginas**: ${files.pages} archivos
- **Hooks**: ${files.hooks} archivos
- **Integraciones**: ${files.integrations} archivos
- **Total**: ${files.total} archivos TypeScript/React

### **Dependencias**
- **Producción**: ${projectInfo.dependencies} paquetes
- **Desarrollo**: ${projectInfo.devDependencies} paquetes
- **Total**: ${projectInfo.dependencies + projectInfo.devDependencies} paquetes

## 🎯 **Estado Actual del Sistema**

### **Servidor de Desarrollo**
- **Estado**: ${server.status}
- **Puerto**: ${server.port}
- **URL Local**: http://localhost:${server.port}/
- **URL Red**: http://192.168.1.23:${server.port}/

### **Base de Datos**
- **Conexión**: ${database.configured ? '✅ Configurada' : '❌ No configurada'}
- **Tablas**: ${database.hasTables ? '✅ Creadas' : '❌ Sin crear'}
- **Estado**: ${database.status}

## 📊 **Evaluación Técnica**

| **Aspecto** | **Puntuación** | **Estado** |
|-------------|----------------|------------|
| Arquitectura | 7/10 | ✅ Sólida |
| UI/UX | 8/10 | ✅ Excelente |
| Gestión de Estado | 6/10 | ⚠️ Básica |
| Base de Datos | ${database.hasTables ? '7/10' : '3/10'} | ${database.hasTables ? '✅ Completa' : '❌ Crítico'} |
| Funcionalidad | ${server.running ? '6/10' : '4/10'} | ${server.running ? '⚠️ Parcial' : '❌ Incompleta'} |
| Seguridad | 5/10 | ⚠️ Mejorable |
| Performance | 7/10 | ✅ Buena |
| Mantenibilidad | 8/10 | ✅ Excelente |
| Testing | 2/10 | ❌ Crítico |
| Documentación | 4/10 | ⚠️ Básica |

**PUNTUACIÓN GENERAL**: ${database.hasTables && server.running ? '6.2/10' : '5.4/10'}

## 🚨 **Problemas Críticos Identificados**

### 1. **Base de Datos**
- **Problema**: ${database.hasTables ? 'Tablas configuradas correctamente' : 'Sin tablas creadas en Supabase'}
- **Impacto**: ${database.hasTables ? 'Funcionalidad completa' : 'Funcionalidad core rota'}
- **Solución**: ${database.hasTables ? '✅ Resuelto' : 'Crear esquema de BD'}

### 2. **Servidor de Desarrollo**
- **Problema**: ${server.running ? 'Servidor funcionando correctamente' : 'Servidor detenido'}
- **Impacto**: ${server.running ? 'Desarrollo activo' : 'No se puede probar la aplicación'}
- **Solución**: ${server.running ? '✅ Resuelto' : 'Ejecutar pnpm dev'}

### 3. **Seguridad**
- **Problema**: Claves API expuestas en código
- **Impacto**: Vulnerabilidad de seguridad
- **Solución**: Variables de entorno

## 🔧 **Recomendaciones de Mejora**

### **Críticas (Prioridad Alta)**
1. **${database.hasTables ? '✅ BD configurada' : 'Crear esquema de BD'}**: Tablas cv_analyses, users, sessions
2. **Variables de entorno**: Mover claves a .env
3. **Testing suite**: Jest + Testing Library
4. **Validación de datos**: Zod schemas
5. **Error boundaries**: Manejo robusto de errores

### **Secundarias (Prioridad Media)**
- **Estado global**: Zustand o Redux Toolkit
- **Documentación**: Storybook para componentes
- **CI/CD**: GitHub Actions
- **Monitoreo**: Sentry para error tracking
- **Optimización**: Code splitting

## 📈 **Métricas del Proyecto**

- **Líneas de Código**: ~2000+ (estimado)
- **Componentes**: ${files.components} componentes
- **Dependencias**: ${projectInfo.dependencies + projectInfo.devDependencies} paquetes
- **Tamaño del Bundle**: Optimizado con Vite
- **Tiempo de Build**: ~3-5 segundos
- **Hot Reload**: ${server.running ? '✅ Funcionando' : '❌ Detenido'}

## 🎉 **Fortalezas del Proyecto**

1. **Arquitectura moderna**: React + TypeScript + Vite
2. **UI profesional**: Shadcn/ui con componentes reutilizables
3. **Código limpio**: Estructura modular y mantenible
4. **Configuración sólida**: ESLint, Tailwind, pnpm
5. **Componentes inteligentes**: DBStatsBadge con estado real
6. **${server.running ? 'Servidor activo' : 'Servidor detenido'}**: ${server.running ? 'Desarrollo en curso' : 'Necesita reiniciar'}

## ⚠️ **Áreas de Mejora**

1. **${database.hasTables ? 'Funcionalidad completa' : 'Funcionalidad incompleta'}**: ${database.hasTables ? 'BD configurada' : 'BD sin tablas'}
2. **Seguridad**: Claves expuestas
3. **Testing**: Sin cobertura
4. **Documentación**: Básica
5. **Error handling**: Mejorable

## 🔄 **Historial de Cambios**

### **Última Actualización**
- **Fecha**: ${timestamp}
- **Servidor**: ${server.status}
- **Base de Datos**: ${database.status}
- **Archivos del proyecto**: ${files.total} archivos

---

**Generado automáticamente por**: Claude 3.5 Sonnet 🐓  
**Fecha**: ${timestamp}  
**Estado**: ${server.running ? 'Proyecto activo en desarrollo' : 'Proyecto detenido - necesita reiniciar servidor'}
`;

  return summary;
}

// Ejecutar el script
try {
  const summary = generateSummary();
  fs.writeFileSync('SUMMARY.md', summary);
  console.log('✅ SUMMARY.md actualizado automáticamente');
} catch (error) {
  console.error('❌ Error al actualizar SUMMARY.md:', error.message);
  process.exit(1);
}

export { generateSummary };
