#!/bin/bash

# Navegar a la carpeta del proyecto
cd "$(dirname "$0")"

# Crear las nuevas carpetas
mkdir -p backend/appointments
mkdir -p frontend
mkdir -p scripts

# === BACKEND ===
mv manage.py settings.py urls.py requirements.txt db.sqlite3 backend/ 2>/dev/null
mv mi_app_citas/Backend/appointments/* backend/appointments/ 2>/dev/null
mv mi_app_citas/Backend/logs backend/ 2>/dev/null

# === FRONTEND ===
mv mi_app_citas/public frontend/ 2>/dev/null
mv mi_app_citas/src frontend/ 2>/dev/null
mv mi_app_citas/package*.json frontend/ 2>/dev/null

# === SCRIPTS ===
mv recordatorios_diarios.py test_recordatorio.py scripts/ 2>/dev/null

# === OPCIONAL: limpia residuos ===
rm -rf mi_app_citas
rm -rf env
rm -rf .venv
rm -rf estructura_proyecto.txt
rm -rf 2.env

echo "✅ Proyecto reorganizado con éxito."
