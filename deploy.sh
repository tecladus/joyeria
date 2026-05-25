#!/bin/bash

# Detener la ejecución ante cualquier error
set -e

# Configuración: usar variables de entorno o valores por defecto
# Para overrides en GitHub Actions, pasar como:
DEPLOY_PATH="${DEPLOY_PATH:-.}"
SERVICE_NAME="${SERVICE_NAME:-joyeria-backend}"

# Asegurar que existe la carpeta de logs
mkdir -p "$DEPLOY_PATH/logs"

echo "=== Iniciando actualización de la plataforma ==="
echo "Ruta de despliegue: $DEPLOY_PATH"
echo "Servicio: $SERVICE_NAME"

# 1. Compilación del Frontend
echo "Compilando Frontend..."
cd frontend
npm install
npm run build
cd ..

# 2. Copiar archivos del Frontend compilados al directorio estático de Spring Boot
echo "Preparando distribución estática..."
rm -rf backend/src/main/resources/static/*
mkdir -p backend/src/main/resources/static
cp -r frontend/dist/* backend/src/main/resources/static/

# 3. Compilación del Backend (Generación del archivo .jar)
echo "Compilando Backend..."
cd backend
mvn clean package -DskipTests
cd ..

# 4. Reinicio de Servicios en Producción
echo "Reiniciando servidor de aplicación..."
if systemctl list-units --type=service | grep -q "$SERVICE_NAME"; then
  sudo systemctl restart "$SERVICE_NAME"
  echo "Servicio '$SERVICE_NAME' reiniciado vía systemctl."
else
  echo "ADVERTENCIA: No se encontró el servicio '$SERVICE_NAME' en systemd."
  echo "Por favor, verifica el nombre del servicio o reinicia el proceso manualmente."
fi

# 5. Ajustar permisos para el servidor web (solo sobre los archivos estáticos compilados)
echo "Ajustando permisos..."
chmod -R 755 "$DEPLOY_PATH/frontend/dist"

echo "=== Despliegue finalizado con éxito ==="
