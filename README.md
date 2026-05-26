# Atelier Aura - Joyería Fina
### Trabajo Práctico Obligatorio (TPO) - UADE (Año 2026, 1er Cuatrimestre)

---

## Información Académica

* **Institución:** Universidad Argentina de la Empresa (UADE)
* **Facultad:** Facultad de Ingeniería (FAIN)

---

## Integrantes del Equipo

| Nombre y Apellido | Legajo |
| :--- | :--- |
| **FICER OCTAVIO BENJAMIN GABRIEL** | *1169301* |
| **KARKOSZKA IVAN** | **1149738** |
| **LOPEZ LOPEZ BAUTISTA** | *(S/D)* |
| **SONCIN ESTEBAN ARIEL** | *1151299* |
| **MONES RUIZ IGNACIO** | *1201656* |
---

## Descripción del Proyecto

**Atelier Aura** es una plataforma de comercio electrónico exclusiva para joyería fina y de alta gama. El diseño visual prioriza la elegancia y la sofisticación utilizando técnicas modernas de desarrollo web como:
* **Rich Aesthetics & Glassmorphism:** Interfaz estilizada con efectos de desenfoque y capas traslúcidas que emulan una joyería física de lujo.
* **Micro-animaciones y Transiciones Fluidas:** Efectos hover y animaciones de carga pulidas para brindar una experiencia de usuario Premium.
* **Diseño Responsivo Dinámico (Adaptive Layout):** Detección avanzada del viewport de pantalla a través de hooks React para optimizar grids y menús en tiempo real (clasificación de rendimiento móvil y descuentos especiales adaptativos).

---

## Arquitectura y Tecnologías

El proyecto se divide en una arquitectura desacoplada de Cliente-Servidor:

### Backend
* **Tecnología Principal:** Java 17 + Spring Boot 3
* **Seguridad:** Spring Security con Autenticación basada en Tokens Stateless JWT (JSON Web Tokens).
* **Persistencia:** JPA / Hibernate mapeado a base de datos PostgreSQL.
* **Control de Excepciones:** `GlobalExceptionHandler` unificado para control de integridad referencial, recursos no encontrados y accesos prohibidos.

### Frontend
* **Tecnología Principal:** React (Vite SPA) + JavaScript (ES6+).
* **Estilos:** Vanilla CSS moderno con variables CSS centralizadas y tokens de diseño para control ágil de HSL, fuentes elegantes y transiciones.
* **Navegación:** React Router para transiciones rápidas sin recarga de página.

---

## Matriz de Control de Acceso (RBAC)

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
