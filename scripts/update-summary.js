#!/usr/bin/env node

/**
 * Script para actualizar automáticamente el archivo SUMMARY.md
 * Se ejecuta después de cada cambio significativo en el proyecto
 */

const fs = require('fs');
const path = require('path');

// Función para obtener información del proyecto
function getProjectInfo() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const gitStatus = require('child_process').execSync('git status --porcelain', { encoding: 'utf8' });
  const lastCommit = require('child_process').execSync('git log -1 --format="%H|%s|%ad" --date=short', { encoding: 'utf8' });
  
  return {
    name: packageJson.name,
    version: packageJson.version,
    dependencies: Object.keys(packageJson.dependencies || {}).length,
    devDependencies: Object.keys(packageJson.devDependencies || {}).length,
    gitStatus: gitStatus.trim().split('\n').filter(line => line.trim()),
    lastCommit: lastCommit.trim().split('|')
  };
}

// Función para analizar la estructura del proyecto
function analyzeProjectStructure() {
  const srcDir = 'src';
  const components = [];
  const pages = [];
  const hooks = [];
  const integrations = [];
  
  function scanDirectory(dir, basePath = '') {
    const fullPath = path.join(srcDir, basePath);
    if (!fs.existsSync(fullPath)) return;
    
    const items = fs.readdirSync(fullPath);
    items.forEach(item => {
      const itemPath = path.join(fullPath, item);
      const relativePath = path.join(basePath, item);
      
      if (fs.statSync(itemPath).isDirectory()) {
        scanDirectory(dir, relativePath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        const category = basePath.split('/')[0] || 'root';
        switch (category) {
          case 'components':
            components.push(relativePath);
            break;
          case 'pages':
            pages.push(relativePath);
            break;
          case 'hooks':
            hooks.push(relativePath);
            break;
          case 'integrations':
            integrations.push(relativePath);
            break;
        }
      }
    });
  }
  
  scanDirectory(srcDir);
  
  return {
    components: components.length,
    pages: pages.length,
    hooks: hooks.length,
    integrations: integrations.length,
    totalFiles: components.length + pages.length + hooks.length + integrations.length
  };
}

// Función para verificar el estado del servidor
function checkServerStatus() {
  try {
    const netstat = require('child_process').execSync('netstat -an | findstr :8080', { encoding: 'utf8' });
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
    const supabaseClient = fs.readFileSync('src/integrations/supabase/client.ts', 'utf8');
    const typesFile = fs.readFileSync('src/integrations/supabase/types.ts', 'utf8');
    
    const hasTables = !typesFile.includes('[_ in never]: never');
    const hasConnection = supabaseClient.includes('createClient');
    
    return {
      configured: hasConnection,
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

// Función principal para generar el summary
function generateSummary() {
  const projectInfo = getProjectInfo();
  const structure = analyzeProjectStructure();
  const server = checkServerStatus();
  const database = analyzeDatabase();
  
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
- **Componentes**: ${structure.components} archivos
- **Páginas**: ${structure.pages} archivos
- **Hooks**: ${structure.hooks} archivos
- **Integraciones**: ${structure.integrations} archivos
- **Total**: ${structure.totalFiles} archivos TypeScript/React

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

### **Git Status**
- **Archivos modificados**: ${projectInfo.gitStatus.length}
- **Último commit**: ${projectInfo.lastCommit[1] || 'N/A'}
- **Fecha**: ${projectInfo.lastCommit[2] || 'N/A'}

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
1. **${database.hasTables ? '✅ BD configurada' : 'Crear esquema de BD'**: Tablas cv_analyses, users, sessions
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
- **Componentes**: ${structure.components} componentes
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
- **Archivos modificados**: ${projectInfo.gitStatus.length}

### **Cambios Pendientes**
${projectInfo.gitStatus.length > 0 ? projectInfo.gitStatus.map(change => `- ${change}`).join('\n') : '- No hay cambios pendientes'}

---

**Generado automáticamente por**: Claude 3.5 Sonnet 🐓  
**Fecha**: ${timestamp}  
**Estado**: ${server.running ? 'Proyecto activo en desarrollo' : 'Proyecto detenido - necesita reiniciar servidor'}
`;

  return summary;
}

// Ejecutar el script
if (require.main === module) {
  try {
    const summary = generateSummary();
    fs.writeFileSync('SUMMARY.md', summary);
    console.log('✅ SUMMARY.md actualizado exitosamente');
  } catch (error) {
    console.error('❌ Error al actualizar SUMMARY.md:', error.message);
    process.exit(1);
  }
}

module.exports = { generateSummary };
