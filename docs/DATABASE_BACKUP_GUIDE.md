# 🗄️ Guía de Respaldo de Base de Datos

Guía completa para respaldar tu base de datos de Supabase (PostgreSQL).

---

## 📋 TABLA DE CONTENIDO

1. [Opciones Disponibles](#-opciones-disponibles)
2. [Opción 1: Supabase Dashboard](#opción-1-supabase-dashboard-más-fácil)
3. [Opción 2: pg_dump CLI](#opción-2-pg_dump-cli-recomendado)
4. [Opción 3: Script Automatizado](#opción-3-script-automatizado)
5. [Opción 4: Supabase CLI](#opción-4-supabase-cli)
6. [Restaurar Backup](#-cómo-restaurar-un-backup)
7. [Automatización](#-automatizar-backups)
8. [Mejores Prácticas](#-mejores-prácticas)

---

## 🎯 OPCIONES DISPONIBLES

| Opción | Dificultad | Plan Supabase | Ventajas | Desventajas |
|--------|-----------|---------------|----------|-------------|
| **Dashboard** | ⭐ Fácil | PRO | Rápido y simple | Solo plan PRO |
| **pg_dump** | ⭐⭐ Media | FREE/PRO | Control total | Requiere instalar PostgreSQL |
| **Script** | ⭐⭐ Media | FREE/PRO | Automatizable | Requiere configuración |
| **Supabase CLI** | ⭐⭐ Media | FREE/PRO | CLI oficial | Requiere instalación |

---

## OPCIÓN 1: Supabase Dashboard (Más Fácil)

### 📋 Para qué sirve
Backup rápido desde la interfaz web de Supabase.

### ✅ Requisitos
- Plan PRO de Supabase ($25/mes)

### 📝 Pasos

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Selecciona tu proyecto: `sblurevkequseuxdbwmj`
3. Settings → Database → Database Backups
4. Click en "Download backup"
5. Guarda el archivo `.sql`

### 💡 Ventajas
- ✅ Súper fácil
- ✅ No requiere instalación
- ✅ Backup completo automático
- ✅ Incluye estructura + datos

### ⚠️ Desventajas
- ❌ Solo plan PRO
- ❌ No personalizable

---

## OPCIÓN 2: pg_dump CLI (Recomendado)

### 📋 Para qué sirve
Backup profesional con control total sobre qué respaldar.

### ✅ Requisitos
- PostgreSQL instalado en tu PC

### 📥 Instalación

**Windows:**
```bash
# Descargar PostgreSQL desde:
https://www.postgresql.org/download/windows/

# O usar Chocolatey:
choco install postgresql

# Verificar instalación:
pg_dump --version
```

### 📝 Configuración

**1. Obtener credenciales:**

Ve a: Supabase Dashboard → Settings → Database → Connection string

Tu connection string es:
```
postgresql://postgres:[PASSWORD]@db.sblurevkequseuxdbwmj.supabase.co:5432/postgres
```

**2. Reemplazar [PASSWORD]:**

El password está en: Settings → Database → Database password

### 🚀 Comandos

#### A. Backup Completo (Estructura + Datos)

```bash
pg_dump "postgresql://postgres:TU_PASSWORD@db.sblurevkequseuxdbwmj.supabase.co:5432/postgres" > backup_completo.sql
```

#### B. Solo Estructura (Schema)

```bash
pg_dump "postgresql://postgres:TU_PASSWORD@db.sblurevkequseuxdbwmj.supabase.co:5432/postgres" --schema-only > backup_estructura.sql
```

#### C. Solo Datos

```bash
pg_dump "postgresql://postgres:TU_PASSWORD@db.sblurevkequseuxdbwmj.supabase.co:5432/postgres" --data-only > backup_datos.sql
```

#### D. Solo una tabla

```bash
pg_dump "postgresql://postgres:TU_PASSWORD@db.sblurevkequseuxdbwmj.supabase.co:5432/postgres" --table=cv_analyses > backup_cv_analyses.sql
```

#### E. Formato comprimido

```bash
pg_dump "postgresql://postgres:TU_PASSWORD@db.sblurevkequseuxdbwmj.supabase.co:5432/postgres" -Fc -f backup_completo.dump
```

### 💡 Ventajas
- ✅ Control total
- ✅ Funciona en plan FREE
- ✅ Backups comprimidos
- ✅ Profesional

### ⚠️ Desventajas
- ❌ Requiere instalar PostgreSQL
- ❌ Más técnico

---

## OPCIÓN 3: Script Automatizado

### 📋 Para qué sirve
Backup automático con un simple comando.

### ✅ Requisitos
- Node.js instalado
- Variables de entorno configuradas

### 📝 Configuración

**1. Crear carpeta de backups:**
```bash
mkdir backups
```

**2. Configurar variables de entorno:**

Edita tu `.env`:
```bash
# Connection string de Supabase
DATABASE_URL=postgresql://postgres:TU_PASSWORD@db.sblurevkequseuxdbwmj.supabase.co:5432/postgres

# URLs de Supabase (ya las tienes)
VITE_SUPABASE_URL=https://sblurevkequseuxdbwmj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_key
```

### 🚀 Uso

#### Backup Completo
```bash
pnpm run backup
```

#### Solo Estructura
```bash
pnpm run backup:schema
```

#### Solo Datos
```bash
pnpm run backup:data
```

### 📂 Resultado

Los backups se guardan en:
```
./backups/
  backup_full_2025-11-04T15-30-00.sql
  backup_schema_2025-11-04T15-30-00.sql
  backup_data_2025-11-04T15-30-00.sql
```

### 💡 Ventajas
- ✅ Automatizable
- ✅ Nombres con timestamp
- ✅ Configurable
- ✅ Scripts npm listos

### ⚠️ Desventajas
- ❌ Requiere configuración inicial

---

## OPCIÓN 4: Supabase CLI

### 📋 Para qué sirve
Backup con la CLI oficial de Supabase.

### 📥 Instalación

```bash
# Instalar CLI
npm install -g supabase

# Verificar
supabase --version

# Login
supabase login

# Link a tu proyecto
supabase link --project-ref sblurevkequseuxdbwmj
```

### 🚀 Comandos

#### Backup completo
```bash
supabase db dump -f backup_completo.sql
```

#### Solo estructura
```bash
supabase db dump -f backup_schema.sql --schema-only
```

#### Solo datos de una tabla
```bash
supabase db dump -f backup_cv_analyses.sql --data-only --table cv_analyses
```

### 💡 Ventajas
- ✅ CLI oficial
- ✅ Integrado con proyecto
- ✅ Funciona en plan FREE

### ⚠️ Desventajas
- ❌ Requiere instalación
- ❌ Configuración inicial

---

## 🔄 CÓMO RESTAURAR UN BACKUP

### Usando psql

```bash
# Restaurar desde archivo .sql
psql "postgresql://postgres:PASSWORD@db.sblurevkequseuxdbwmj.supabase.co:5432/postgres" < backup_completo.sql
```

### Usando pg_restore (para archivos .dump)

```bash
pg_restore -d "postgresql://postgres:PASSWORD@db.sblurevkequseuxdbwmj.supabase.co:5432/postgres" backup_completo.dump
```

### ⚠️ ADVERTENCIA

Restaurar un backup **sobrescribirá** los datos existentes. Siempre haz un backup antes de restaurar.

---

## 🤖 AUTOMATIZAR BACKUPS

### Opción A: Cron Job (Linux/Mac)

```bash
# Editar crontab
crontab -e

# Backup diario a las 2 AM
0 2 * * * cd /ruta/a/tu/proyecto && pnpm run backup
```

### Opción B: Task Scheduler (Windows)

1. Abre "Programador de tareas"
2. Crear tarea básica
3. Trigger: Diario a las 2 AM
4. Acción: Iniciar programa
   - Programa: `pnpm`
   - Argumentos: `run backup`
   - Directorio: `E:\github\job-parse-pal`

### Opción C: GitHub Actions

Crea `.github/workflows/backup.yml`:

```yaml
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *'  # Diario a las 2 AM
  workflow_dispatch:  # Manual

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install -g pnpm && pnpm install
      
      - name: Run backup
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}
        run: pnpm run backup
      
      - name: Upload backup
        uses: actions/upload-artifact@v3
        with:
          name: database-backup
          path: backups/
```

---

## 📝 MEJORES PRÁCTICAS

### 1. Frecuencia de Backups

- **Datos críticos:** Diario
- **Datos medios:** Semanal
- **Datos bajos:** Mensual

### 2. Retención

Mantén:
- Últimos 7 backups diarios
- Últimos 4 backups semanales
- Últimos 12 backups mensuales

### 3. Almacenamiento

Guarda backups en:
- ✅ Disco local
- ✅ Cloud storage (Google Drive, Dropbox)
- ✅ GitHub (privado)
- ✅ AWS S3 / Azure Blob

### 4. Verificación

Prueba restaurar backups regularmente para asegurar que funcionan.

### 5. Seguridad

- ❌ **NO** commitear backups a Git
- ✅ Agregar `backups/` a `.gitignore`
- ✅ Encriptar backups con datos sensibles

---

## 📊 SCRIPT DE LIMPIEZA

Para mantener solo los últimos 7 backups:

```bash
# Linux/Mac
find ./backups -type f -name "backup_*.sql" -mtime +7 -delete

# Windows PowerShell
Get-ChildItem -Path ./backups -Filter "backup_*.sql" | 
  Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-7)} | 
  Remove-Item
```

---

## 🐛 TROUBLESHOOTING

### Error: "pg_dump: command not found"

**Solución:** Instala PostgreSQL o agrega al PATH:
```bash
# Windows: Agregar a PATH
C:\Program Files\PostgreSQL\15\bin
```

### Error: "connection refused"

**Solución:** Verifica tu connection string y password.

### Error: "permission denied"

**Solución:** Asegúrate de que el directorio `backups/` exista y tenga permisos de escritura.

---

## 📚 RECURSOS

- [Supabase Backup Docs](https://supabase.com/docs/guides/database/backups)
- [PostgreSQL pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

---

## ✅ RECOMENDACIÓN FINAL

**Para JP:**

1. **Desarrollo:** Usa `pnpm run backup` (script automatizado)
2. **Producción:** Configura backup automático diario con GitHub Actions
3. **Emergencias:** Usa pg_dump directo

**Comando recomendado:**
```bash
# Backup completo con timestamp
pnpm run backup
```

---

**Desarrollado por JP para Job Parse Pal** 🐓



