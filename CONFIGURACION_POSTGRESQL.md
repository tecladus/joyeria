# 🗄️ Configuración PostgreSQL

## Cambios Realizados

El proyecto ahora está configurado para usar **PostgreSQL** en lugar de H2 en memoria. Esto significa que:

✅ **La base de datos persiste** entre reinicios del servidor  
✅ **Sin pérdida de datos** al actualizar la aplicación  
✅ **Mejor para producción** - PostgreSQL es más robusto  
✅ **Dependencia ya instalada** - El pom.xml ya tiene el driver

---

## Configuración en Desarrollo

### Opción 1: Usar PostgreSQL Local

**Requisitos:**
- PostgreSQL instalado y corriendo en localhost:5432

**Variables de Entorno (opcional):**
```bash
DB_HOST=localhost          # Default: localhost
DB_PORT=5432               # Default: 5432
DB_NAME=joyeria_db         # Default: joyeria_db
DB_USER=postgres           # Default: postgres
DB_PASSWORD=               # Default: vacío
```

**Crear la BD (si no existe):**
```sql
CREATE DATABASE joyeria_db;
```

### Opción 2: Usar H2 en Desarrollo

Si prefieres seguir con H2 para desarrollo local:

1. Abre `application.properties`
2. Reemplaza:
```properties
spring.datasource.url=jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:joyeria_db}
spring.datasource.driver-class-name=org.postgresql.Driver
```

Con:
```properties
spring.datasource.url=jdbc:h2:file:./data/joyeria_db;MODE=PostgreSQL
spring.datasource.driver-class-name=org.h2.Driver
spring.h2.console.enabled=true
```

---

## Configuración en Producción

### Variables de Entorno Requeridas

Configura estas variables en tu servidor:

```bash
# Credenciales de BD
DB_HOST=servidor.com
DB_PORT=5432
DB_NAME=joyeria_db
DB_USER=postgres_user
DB_PASSWORD=tu_password_segura

# JWT
JWT_SECRET=tu_clave_secreta_muy_larga_minimo_32_caracteres

# CORS
CORS_ALLOWED_ORIGINS=https://tudominio.com

# Puerto
SERVER_PORT=8080

# AWS (si usas Secrets Manager)
AWS_REGION=us-east-1
```

### Lanzar en Producción

```bash
java -jar joyeria.jar --spring.profiles.active=prod
```

---

## Flujo de Datos

### Desarrollo (application.properties)
```
Usuario → Frontend (Vite) → Backend (8080) → PostgreSQL (5432)
                                                ↓
                          Los datos persisten entre reinicios
```

### Producción (application-prod.properties)
```
Usuario → HTTPS → Frontend (Nginx) → Backend (8080) → PostgreSQL (5432)
                                         ↓
                          AWS Secrets Manager (credenciales seguras)
```

---

## Migraciones de Datos

### Resetear BD (borrar todo y recargar)

En **desarrollo**, cambiar en `application.properties`:
```properties
spring.jpa.hibernate.ddl-auto=create
```

Luego cambiar de vuelta a:
```properties
spring.jpa.hibernate.ddl-auto=update
```

En **producción**, NUNCA cambies a `create` a menos que sepas lo que haces.

---

## Verificar Conexión

### Desde CLI
```bash
psql -h localhost -U postgres -d joyeria_db -c "SELECT 1;"
```

### Desde Logs del Servidor
Cuando el servidor inicia correctamente, verás:
```
HHH000035: Connection pool size: 10
```

---

## Troubleshooting

### Error: "Connection refused"
- PostgreSQL no está corriendo
- Puerto incorrecto en `DB_PORT`
- Host incorrecto en `DB_HOST`

**Solución:**
```bash
# Iniciar PostgreSQL
sudo service postgresql start  # Linux
brew services start postgresql # macOS
# Windows: usar pgAdmin o PostgreSQL Installer
```

### Error: "database joyeria_db does not exist"
```sql
CREATE DATABASE joyeria_db;
```

### Error: "permission denied for schema public"
Asegúrate de que el usuario tiene permisos:
```sql
GRANT ALL ON SCHEMA public TO postgres_user;
```

### Datos se borran al reiniciar (en desarrollo)
Verifica que `ddl-auto` sea `update`, no `create`

---

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `pom.xml` | Ya tiene PostgreSQL como dependencia |
| `application.properties` | Configurado para PostgreSQL en desarrollo |
| `application-prod.properties` | Configurado para PostgreSQL + AWS Secrets |

---

## Resumen

✅ PostgreSQL está configurado en `application.properties`  
✅ Datos persisten entre reinicios  
✅ Producción usa variables de entorno seguras  
✅ AWS Secrets Manager habilitado en producción  
✅ Sin cambios en el código de la aplicación  

Los datos ya no se borran al actualizar el servidor. 🎉
