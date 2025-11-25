#!/usr/bin/env python3
import os
import csv
import fnmatch
from collections import defaultdict

# ==================================================================
# 1) CONFIGURACIÓN MEJORADA DE EXCLUSIONES
# ==================================================================

# Extensiones relevantes (código fuente y configuraciones esenciales)
INCLUDE_EXT = {
    ".java", ".py", ".js", ".ts", ".jsx", ".tsx", ".html", ".css", 
    ".scss", ".sass", ".less", ".vue", ".svelte",
    ".c", ".cpp", ".h", ".hpp", ".cs", ".go", ".rs", ".rb", ".php",
    ".yaml", ".yml", ".md", ".txt", ".sh", ".bat", ".ps1",
    ".sql", ".graphql", ".proto",
    ".gitignore", ".dockerignore", ".env.example"
}

# Archivos de configuración importantes (incluir SOLO estos JSON/XML específicos)
IMPORTANT_CONFIG_FILES = {
    # JavaScript/TypeScript
    "package.json", "tsconfig.json", "vite.config.js", "vite.config.ts",
    "webpack.config.js", "rollup.config.js", "jest.config.js",
    "tailwind.config.js", "postcss.config.js", ".eslintrc.json",
    
    # Java
    "pom.xml", "build.gradle", "settings.gradle", "application.properties",
    "application.yml", "application.yaml",
    
    # Python
    "requirements.txt", "Pipfile", "pyproject.toml", "setup.py", "poetry.lock",
    
    # Docker & Infrastructure
    "Dockerfile", "docker-compose.yml", "docker-compose.yaml",
    ".dockerignore", "nginx.conf", "Makefile",
    
    # Otros
    "README.md", "README.txt", "LICENSE", "Cargo.toml", "go.mod",
    "composer.json", "Gemfile", "pubspec.yaml", "CMakeLists.txt"
}

# Directorios a EXCLUIR completamente
EXCLUDE_DIRS = {
    ".git", ".vscode", ".idea", "node_modules", "dist", "build",
    "__pycache__", "venv", ".venv", "bin", "obj", "target",
    "postgres-data", "coverage", "logs", "tmp", "temp", "cache",
    ".next", ".nuxt", "out", "public", "static", "assets",
    "vendor", "bower_components", "jspm_packages"
}

# Patrones de archivos a EXCLUIR (incluso si tienen extensión válida)
EXCLUDE_FILE_PATTERNS = {
    # Archivos de traducción/localización (i18n)
    "**/locales/**/*.json",
    "**/lang/**/*.json",
    "**/i18n/**/*.json",
    "**/translations/**/*.json",
    "**/*-i18n.json",
    "**/*.i18n.json",
    # Patrones de idiomas comunes
    "**/en.json", "**/es.json", "**/fr.json", "**/de.json", "**/it.json",
    "**/pt.json", "**/ja.json", "**/zh.json", "**/ko.json", "**/ru.json",
    "**/en-US.json", "**/es-ES.json", "**/fr-FR.json",
    
    # Archivos de lock y generados
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    "composer.lock", "Gemfile.lock", "poetry.lock",
    
    # Mapas y archivos minificados
    "*.min.js", "*.min.css", "*.map", "*.bundle.js",
    
    # Archivos de test/mock data grandes
    "**/test-data/**", "**/mock-data/**", "**/fixtures/**/*.json",
    
    # Otros archivos comunes no esenciales
    ".DS_Store", "Thumbs.db", "*.log", "*.pid", "*.seed",
    "*.swp", "*.swo", "*~"
}

# Nombres de archivos JSON específicos a EXCLUIR
EXCLUDE_JSON_FILES = {
    # Traducciones
    "en.json", "es.json", "fr.json", "de.json", "it.json", "pt.json",
    "ja.json", "zh.json", "ko.json", "ru.json", "ar.json", "hi.json",
    "en-US.json", "en-GB.json", "es-ES.json", "es-MX.json", "fr-FR.json",
    "pt-BR.json", "zh-CN.json", "zh-TW.json",
    
    # Archivos de lock
    "package-lock.json", "yarn.lock", "composer.lock",
    
    # Otros archivos grandes/generados comunes
    "tsconfig.tsbuildinfo", ".eslintcache"
}

# ==================================================================
# 2) FUNCIÓN PARA VERIFICAR EXCLUSIONES MEJORADA
# ==================================================================
def should_exclude(filepath: str) -> bool:
    """Determina si un archivo debe excluirse del TXT"""
    filename = os.path.basename(filepath)
    
    # Excluir por directorio
    path_parts = filepath.split(os.sep)
    if any(ex_dir in path_parts for ex_dir in EXCLUDE_DIRS):
        return True
    
    # Verificar patrones de exclusión
    for pattern in EXCLUDE_FILE_PATTERNS:
        if fnmatch.fnmatch(filepath, pattern):
            return True
    
    # Excluir archivos JSON específicos (traducciones, locks, etc.)
    if filename in EXCLUDE_JSON_FILES:
        return True
    
    # Excluir archivos de más de 200KB (excepto SQL)
    try:
        if os.path.getsize(filepath) > 200 * 1024:  # 200KB
            _, ext = os.path.splitext(filename)
            if ext.lower() not in {".sql", ".md"}:
                return True
    except OSError:
        pass
    
    # Excluir archivos que parecen ser de traducción por su ubicación
    lower_path = filepath.lower()
    if any(indicator in lower_path for indicator in ['/locales/', '/lang/', '/i18n/', '/translations/']):
        if filename.endswith('.json') and filename not in IMPORTANT_CONFIG_FILES:
            return True
    
    return False

def is_important_file(filename: str, filepath: str) -> bool:
    """Determina si un archivo es importante para incluir en el TXT"""
    # Archivos de configuración importantes
    if filename in IMPORTANT_CONFIG_FILES:
        return True
    
    # Archivos con extensiones de código fuente
    _, ext = os.path.splitext(filename)
    if ext.lower() in INCLUDE_EXT:
        return True
    
    # Archivos sin extensión pero importantes
    if not ext and filename in {"Dockerfile", "Makefile", "Procfile"}:
        return True
    
    return False

# ==================================================================
# 3) LÓGICA PRINCIPAL MEJORADA
# ==================================================================
ROOT = os.getcwd()
PROJECT_NAME = os.path.basename(ROOT)
OUT_TXT = f"{PROJECT_NAME}.txt"
OUT_CSV = f"{PROJECT_NAME}_estructura.csv"

groups = defaultdict(list)
all_entries = []
excluded_count = 0
included_count = 0

print("🔍 Iniciando procesamiento del proyecto...")
print(f"📁 Proyecto: {PROJECT_NAME}\n")

for dirpath, dirnames, filenames in os.walk(ROOT, topdown=True):
    # Excluir directorios no deseados
    dirnames[:] = [d for d in dirnames if d not in EXCLUDE_DIRS]
    
    rel_path = os.path.relpath(dirpath, ROOT)
    if rel_path == ".":
        rel_path = PROJECT_NAME
    
    all_entries.append((rel_path, "Directory"))

    for filename in filenames:
        filepath = os.path.join(dirpath, filename)
        rel_file = os.path.relpath(filepath, ROOT)
        
        # Siempre incluir en el CSV para tener la estructura completa
        all_entries.append((rel_file, "File"))
        
        # Para el TXT, aplicar filtros estrictos
        if should_exclude(filepath):
            excluded_count += 1
            continue
        
        if is_important_file(filename, filepath):
            groups[rel_path].append(filepath)
            included_count += 1
        else:
            excluded_count += 1

# ==================================================================
# 4) GENERAR ARCHIVO TXT OPTIMIZADO
# ==================================================================
print("📝 Generando archivo TXT con código relevante...")

with open(OUT_TXT, "w", encoding="utf-8") as out:
    out.write(f"// PROJECT: {PROJECT_NAME}\n")
    out.write("// ================================================\n")
    out.write(f"// Archivos incluidos: {included_count}\n")
    out.write(f"// Archivos excluidos: {excluded_count}\n")
    out.write("// ================================================\n\n")
    
    for folder, files in sorted(groups.items()):
        if not files: 
            continue
        
        out.write(f"\n\n{'='*60}\n")
        out.write(f"DIR: {folder}\n")
        out.write(f"{'='*60}\n\n")
        
        for filepath in sorted(files):
            filename = os.path.basename(filepath)
            rel_path = os.path.relpath(filepath, ROOT)
            
            out.write(f"\n{'─'*60}\n")
            out.write(f"FILE: {rel_path}\n")
            out.write(f"{'─'*60}\n\n")
            
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                    # Limitar líneas extremadamente largas (evitar archivos minificados que pasaron el filtro)
                    lines = content.split('\n')
                    if any(len(line) > 500 for line in lines[:10]):  # Revisar primeras 10 líneas
                        out.write(f"/* ARCHIVO OMITIDO: Parece ser código minificado o generado */\n")
                        continue
                    out.write(content)
                    if not content.endswith('\n'):
                        out.write('\n')
            except UnicodeDecodeError:
                try:
                    with open(filepath, "r", encoding="latin-1") as f:
                        content = f.read()
                        out.write(content)
                        if not content.endswith('\n'):
                            out.write('\n')
                except Exception as e:
                    out.write(f"/* ERROR AL LEER ARCHIVO: {str(e)} */\n")
            except Exception as e:
                out.write(f"/* ERROR AL LEER ARCHIVO: {str(e)} */\n")
    
    out.write(f"\n\n{'='*60}\n")
    out.write("END OF PROJECT\n")
    out.write(f"{'='*60}\n")

# Calcular tamaño del archivo generado
txt_size = os.path.getsize(OUT_TXT) / 1024  # KB

print(f"\n✅ Archivo TXT optimizado creado: {OUT_TXT}")
print(f"   📊 Tamaño: {txt_size:.2f} KB")
print(f"   📄 Archivos incluidos: {included_count}")
print(f"   🚫 Archivos excluidos: {excluded_count}")

# ==================================================================
# 5) GENERAR CSV DE ESTRUCTURA (SIN CAMBIOS)
# ==================================================================
print("\n📋 Generando CSV con estructura completa...")

with open(OUT_CSV, "w", newline="", encoding="utf-8") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["Path", "Type"])
    writer.writerow([PROJECT_NAME, "Directory"])
    
    for path, type_ in sorted(all_entries):
        if path == PROJECT_NAME: 
            continue
        writer.writerow([path, type_])

csv_size = os.path.getsize(OUT_CSV) / 1024  # KB

print(f"\n✅ Estructura CSV creada: {OUT_CSV}")
print(f"   📊 Tamaño: {csv_size:.2f} KB")
print(f"   📁 Entradas totales: {len(all_entries)}")

print(f"\n🎉 Procesamiento completado para el proyecto: {PROJECT_NAME}")
print("\n" + "="*60)