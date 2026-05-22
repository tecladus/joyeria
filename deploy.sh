#!/bin/bash

# Detener la ejecución ante cualquier error
set -e

# Asegurar que existe la carpeta de logs
mkdir -p /var/www/temp_facu/logs

echo "=== Iniciando actualización de la plataforma ==="

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
# Intentar reiniciar usando systemd si está registrado como un servicio
if systemctl list-units --type=service | grep -q "joyeria-backend"; then
  sudo systemctl restart joyeria-backend
  echo "Servicio 'joyeria-backend' reiniciado vía systemctl."
elif systemctl list-units --type=service | grep -q "joyeria"; then
  sudo systemctl restart joyeria
  echo "Servicio 'joyeria' reiniciado vía systemctl."
else
  echo "ADVERTENCIA: No se encontró el servicio 'joyeria-backend' ni 'joyeria' en systemd."
  echo "Por favor, crea el servicio systemd o reinicia el proceso del backend manualmente."
fi

# 5. Ajustar permisos para el servidor web Apache (solo sobre los archivos estáticos compilados)
echo "Ajustando permisos de lectura y ejecución para Apache..."
chmod -R 755 /var/www/temp_facu/frontend/dist

echo "=== Despliegue finalizado con éxito para todo el mundo ==="
