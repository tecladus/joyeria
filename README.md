# Atelier Aura - Joyería Fina
### Trabajo Práctico Obligatorio (TPO) - UADE (Año 2026, 1er Cuatrimestre)

---

## 🏛️ Información Académica

* **Institución:** Universidad Argentina de la Empresa (UADE)
* **Facultad:** Facultad de Ingeniería (FAIN)
* **Departamento:** Departamento de Tecnología Informática Ciclo (DETIN)
* **Materia:** Aplicaciones Interactivas (Código: `3.4.082`)
* **Docente:** Cuello, Gisele Gabriela
* **N° de Clase:** 6219

---

## 👥 Integrantes del Equipo

| Nombre y Apellido | Legajo | Rol Principal |
| :--- | :--- | :--- |
| **FICER OCTAVIO BENJAMIN GABRIEL** | *(S/D)* | Fullstack Developer / UI Designer |
| **KARKOSZKA IVAN** | **1149738** | Fullstack Developer / Security Engineer |
| **LOPEZ LOPEZ BAUTISTA** | *(S/D)* | Frontend Developer / QA Tester |
| **SONCIN ESTEBAN ARIEL** | *(S/D)* | Backend Developer / DB Administrator |

---

## 💎 Descripción del Proyecto

**Atelier Aura** es una plataforma de comercio electrónico exclusiva para joyería fina y de alta gama. El diseño visual prioriza la elegancia y la sofisticación utilizando técnicas modernas de desarrollo web como:
* **Rich Aesthetics & Glassmorphism:** Interfaz estilizada con efectos de desenfoque y capas traslúcidas que emulan una joyería física de lujo.
* **Micro-animaciones y Transiciones Fluidas:** Efectos hover y animaciones de carga pulidas para brindar una experiencia de usuario Premium.
* **Diseño Responsivo Dinámico (Adaptive Layout):** Detección avanzada del viewport de pantalla a través de hooks React para optimizar grids y menús en tiempo real (clasificación de rendimiento móvil y descuentos especiales adaptativos).

---

## 🛠️ Arquitectura y Tecnologías

El proyecto se divide en una arquitectura desacoplada de Cliente-Servidor:

### ☕ Backend
* **Tecnología Principal:** Java 17 + Spring Boot 3
* **Seguridad:** Spring Security con Autenticación basada en Tokens Stateless JWT (JSON Web Tokens).
* **Persistencia:** JPA / Hibernate mapeado a base de datos PostgreSQL.
* **Control de Excepciones:** `GlobalExceptionHandler` unificado para control de integridad referencial, recursos no encontrados y accesos prohibidos.

### ⚛️ Frontend
* **Tecnología Principal:** React (Vite SPA) + JavaScript (ES6+).
* **Estilos:** Vanilla CSS moderno con variables CSS centralizadas y tokens de diseño para control ágil de HSL, fuentes elegantes y transiciones.
* **Navegación:** React Router para transiciones rápidas sin recarga de página.

---

## 🔐 Matriz de Control de Acceso (RBAC)

El sistema implementa 4 roles de usuario diferenciados con su respectivo nivel de autorización:

1. **ADMIN (Administrador Único):**
   * Panel de Métricas (volumen total de ventas, órdenes y usuarios).
   * Gestión Completa de Usuarios (cambio de roles y eliminación permanente de cuentas; seguridad implementada para evitar la auto-eliminación y duplicación de administradores).
   * Edición Avanzada de Catálogo (modificación total de productos: nombre, precio, descripción, stock, categoría y URL de la imagen).
   * Creación, actualización (edición en línea) e eliminación de Categorías.
   * Gestión y cambio de estado de órdenes de compra (Pendiente, Entregado, Cancelado).
2. **MODERATOR (Moderador del Sistema):**
   * Vista de auditoría de usuarios y categorías.
   * Moderación de contenido (capacidad para dar de baja piezas del catálogo que infrinjan políticas).
   * Actualización del estado de órdenes operativas.
3. **VENDEDOR:**
   * Panel de Vendedor propio para administrar su inventario publicado.
   * Capacidad de publicar nuevas creaciones artesanales.
   * Aplicar descuentos promocionales individuales (%) en tiempo real.
   * Editar y eliminar sus propios productos.
4. **COMPRADOR:**
   * Navegación interactiva por colecciones y categorías.
   * Barra de búsqueda integrada en la cabecera (NavBar) sincronizada con parámetros de URL.
   * Gestión interactiva del Carrito de Compras.
   * Proceso de checkout directo con actualización automática de stock físico.
   * Panel personal de "Mis Compras" para consultar el historial de órdenes y sus respectivos estados de entrega.

---

## 🚀 Guía de Instalación y Ejecución

### Requisitos Previos
* Java Development Kit (JDK) 17 instalado.
* Node.js (v16+) y npm instalados.
* PostgreSQL instalado y activo en el puerto local 5432.

### 1. Inicialización de la Base de Datos
1. Inicia sesión en tu terminal o cliente de PostgreSQL.
2. Crea una base de datos vacía llamada `joyeria_db`:
   ```sql
   CREATE DATABASE joyeria_db;
   ```
3. Ejecuta el script de siembra ubicado en la raíz del proyecto para inicializar la estructura, roles predeterminados, categorías base y productos iniciales de demostración:
   * **Script a ejecutar:** [INSERT_USUARIOS.sql](file:///c:/desarrollo/joyeria/INSERT_USUARIOS.sql)
   * **Credencial general de prueba:** Contraseña para todos los usuarios semilla es `password123`.

### 2. Configurar y Correr el Backend
1. Abre una terminal en el directorio `backend/`.
2. Ejecuta las variables de entorno de base de datos o asegúrate de que coincidan en el archivo `application.properties`.
3. Inicia la aplicación Spring Boot:
   ```bash
   mvn spring-boot:run
   ```
   *(También puedes utilizar el script conveniente en la raíz: `run-backend.bat`)*

### 3. Configurar y Correr el Frontend
1. Abre una terminal en el directorio `frontend/`.
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo Vite:
   ```bash
   npm run dev
   ```
   *(También puedes utilizar el script conveniente en la raíz: `run-frontend.bat`)*
4. Abre tu navegador en la URL indicada (habitualmente [http://localhost:5173](http://localhost:5173)).
