# 💎 Sistema de Precios Dinámicos por Dispositivo

## Descripción General

El sistema de precios dinámicos ajusta automáticamente los precios de los productos basándose en la calidad y las especificaciones del dispositivo que está utilizando el usuario.

**Filosofía:** Los usuarios con dispositivos premium (mejor experiencia de visualización) pagan un poco más. Los usuarios con dispositivos básicos reciben un descuento. Es una forma de mantener precios justos en todas las plataformas.

---

## Cómo Funciona

### 1. Detección de Especificaciones

El sistema detecta automáticamente las siguientes características del dispositivo:

| Característica | Método de Detección | Puntos Máx |
|---|---|---|
| **GPU** | WebGL Renderer Info | 15 |
| **CPU Cores** | `navigator.hardwareConcurrency` | 20 |
| **RAM/Memory** | `navigator.deviceMemory` | 25 |
| **Resolución de Pantalla** | `screen.width/height` | 20 |
| **WebGL 2.0** | Canvas API | 15 |
| **Pantalla Táctil** | Touch API | 5 |
| **Conexión de Red** | Network Information API | 10 |

### 2. Cálculo de Puntuación

Se suman puntos basados en las especificaciones detectadas (máximo 100 puntos):

```
Puntuación Total = suma de puntos por cada característica
```

### 3. Clasificación por Tier

Según la puntuación, el dispositivo se clasifica en tiers:

| Tier | Rango | Multiplicador | Efecto | 
|---|---|---|---|
| **Very Poor** | 0-25 | **0.85x** | **-15% descuento** |
| **Poor** | 25-45 | **0.92x** | **-8% descuento** |
| **Average** | 45-60 | **1.00x** | **Precio Normal** |
| **Good** | 60-75 | **1.12x** | **+12% aumento** |
| **Excellent** | 75-100 | **1.20x** | **+20% aumento** |

### 4. Aplicación del Multiplicador

El precio final se calcula así:

```javascript
// 1. Aplicar descuento de producto (si existe)
precioConDescuento = precio * (1 - descuento/100)

// 2. Aplicar multiplicador de dispositivo
precioFinal = precioConDescuento * multiplicador
```

**Ejemplo:**
```
Anillo de Diamante: $5,000 (precio base)
Descuento: 10% → $4,500
Multiplicador: 1.12x (dispositivo good) → $5,040

Usuario con dispositivo muy malo:
$5,000 * 0.90 (sin desc) * 0.85 = $3,825
```

---

## Archivos Modificados

### Nuevos Archivos

#### `frontend/src/services/deviceDetection.js`
- **DeviceDetector**: Clase que detecta especificaciones y calcula multiplicadores
- **useDeviceMultiplier()**: Hook que devuelve el multiplicador
- **adjustPriceByDevice()**: Función para ajustar precios
- **useDeviceReport()**: Hook para obtener reporte completo

#### `frontend/src/components/DeviceReportModal.jsx`
- Modal flotante en la esquina inferior izquierda
- Botón con icono de dispositivo: 🔌
- Muestra:
  - Tier del dispositivo
  - Multiplicador aplicado
  - Especificaciones detectadas
  - Puntuación total (0-100)
  - Explicación del sistema

### Archivos Modificados

#### `frontend/src/components/TarjetaProducto.jsx`
- Importa `adjustPriceByDevice` y `useDeviceMultiplier`
- Calcula `precioAjustado` con multiplicador
- Muestra indicador visual de ajuste:
  - Verde si hay descuento: `-X% desc. Dispositivo básico`
  - Rojo si hay aumento: `+X% Dispositivo premium`

#### `frontend/src/pages/DetalleProducto.jsx`
- Importa `adjustPriceByDevice` y `useDeviceMultiplier`
- Muestra precio ajustado en la sección de detalles
- Incluye badge/chip con información del ajuste
- Ícono + / − para indicar aumento/descuento

#### `frontend/src/App.jsx`
- Importa y renderiza `<DeviceReportModal />` globalmente
- Disponible en todas las páginas

---

## Ejemplos de Uso

### Ejemplo 1: iPhone 15 (Dispositivo Excelente)

```
Especificaciones detectadas:
- 8 cores → 15 puntos
- 6 GB RAM → 12 puntos
- 2532x1179 resolución → 15 puntos
- GPU Apple M2 → 14 puntos
- WebGL 2.0 → Sí (15 puntos)
- Touchscreen → Sí (5 puntos)
- Conexión 5G → 10 puntos
─────────────────
Total: 86 puntos → EXCELLENT (1.20x)

Anillo de $1,000 → $1,200
```

### Ejemplo 2: Laptop Antigua (Dispositivo Pobre)

```
Especificaciones detectadas:
- 2 cores → 5 puntos
- 2 GB RAM → 4 puntos
- 1024x768 resolución → 5 puntos
- GPU Intel HD → 0 puntos
- WebGL 2.0 → No
- Touchscreen → No
- Conexión 3G → 5 puntos
─────────────────
Total: 19 puntos → VERY POOR (0.85x)

Anillo de $1,000 → $850
```

### Ejemplo 3: Desktop Gaming (Dispositivo Bueno)

```
Especificaciones detectadas:
- 16 cores → 20 puntos
- 32 GB RAM → 25 puntos
- 2560x1440 resolución → 20 puntos
- GPU RTX 4080 → 12 puntos
- WebGL 2.0 → Sí (15 puntos)
- Touchscreen → No (0 puntos)
- Conexión 5G → 10 puntos
─────────────────
Total: 102 puntos (capped at 100) → EXCELLENT (1.20x)

Anillo de $1,000 → $1,200
```

---

## Componentes Clave

### DeviceDetector Class

```javascript
// Crear instancia
const detector = new DeviceDetector();

// Métodos principales
detector.detectSpecs()        // Devuelve objeto con specs
detector.calculateTier()      // Calcula score (0-100)
detector.calculateMultiplier() // Devuelve { tier, multiplier, label }
detector.adjustPrice(precio)  // Ajusta un precio
detector.getReport()          // Reporte completo
```

### Hooks de React

```javascript
// En cualquier componente:
import { useDeviceMultiplier, useDeviceReport, adjustPriceByDevice } from './services/deviceDetection';

// Hook 1: Obtener multiplicador
const multiplier = useDeviceMultiplier();
// {
//   tier: 'excellent',
//   multiplier: 1.2,
//   label: 'Dispositivo premium',
//   description: '20% aumento'
// }

// Hook 2: Obtener reporte completo
const report = useDeviceReport();
// {
//   specs: { ... },
//   score: 85,
//   priceAdjustment: { ... }
// }

// Función: Ajustar un precio
const precioAjustado = adjustPriceByDevice(1000);
```

---

## Visualización para el Usuario

### 1. En la Tarjeta de Producto

```
┌─────────────────────┐
│   [Imagen]          │
│   -10% DTO          │ ← Badge de descuento original
└─────────────────────┘
Anillo de Plata
$450
-8% desc. Dispositivo básico ← Ajuste de dispositivo
```

### 2. En la Página de Detalle

```
═══════════════════════════════════════
Anillo de Diamante Clásico
$5,400
─────────────────────────────────────
┌─────────────────────────────────────┐
│ ↑ +12% Dispositivo de alta gama    │
└─────────────────────────────────────┘
```

### 3. Modal de Información (Botón 🔌)

```
╔════════════════════════════════════╗
║  Tu Dispositivo                    ║
║  Análisis de especificaciones      ║
╠════════════════════════════════════╣
║ Dispositivo de alta gama           ║
║ Multiplicador: 1.12x               ║
║ +12% aumento                       ║
║ Puntuación: 68/100                 ║
╠════════════════════════════════════╣
║ Especificaciones Detectadas:       ║
║ Núcleos CPU: 8                     ║
║ Memoria RAM: 8 GB                  ║
║ Resolución: 1920x1080             ║
║ GPU: Integrada                     ║
║ WebGL 2.0: Sí                      ║
║ Pantalla Táctil: No                ║
╚════════════════════════════════════╝
```

---

## Consideraciones Técnicas

### Performance
- ✅ Detección ocurre una sola vez al cargar la página
- ✅ Cálculos en memoria, sin requests al servidor
- ✅ Hooks memoizados para evitar re-renders innecesarios

### Privacidad
- ✅ Los datos de dispositivo NO se envían al servidor
- ✅ Solo se usa para ajustar precios localmente
- ✅ El usuario puede ver exactamente qué se detecta en el modal

### Precisión
- ✅ Usa APIs estándar de navegador (no guesses)
- ✅ Graceful degradation si APIs no están disponibles
- ✅ Valores por defecto conservadores

### Compatibilidad
- ✅ Funciona en todos los navegadores modernos
- ✅ Safari, Chrome, Firefox, Edge
- ✅ Dispositivos móviles y desktop
- ✅ Fallback a precio normal si no se puede detectar

---

## Modificaciones Futuras Posibles

Si en el futuro quieres ajustar el sistema:

### Cambiar Rangos de Tier
```javascript
// En deviceDetection.js, método calculateMultiplier()
if (tier < 30) { // Cambiar de 25
  return { tier: 'very-poor', multiplier: 0.80, ... }; // Cambiar multiplicador
}
```

### Cambiar Puntos por Característica
```javascript
// En deviceDetection.js, método calculateTier()
if (this.specs.cores >= 10) score += 25; // Cambiar puntos
```

### Agregar Nueva Característica
```javascript
// 1. Agregar detección en detectSpecs()
this.specs.newFeature = this.detectNewFeature();

// 2. Agregar al cálculo de puntos en calculateTier()
if (this.specs.newFeature) score += 10;
```

---

## Notas Importantes

⚠️ **El multiplicador se aplica DESPUÉS del descuento original**
- Primero se aplica el descuento porcentual del producto
- Luego se multiplica por el factor del dispositivo
- Esto significa que un producto con descuento en un dispositivo premium podría costar más que sin descuento

💡 **Los usuarios pueden manipular esto (teóricamente)**
- Como el cálculo es client-side, podrían usar DevTools para cambiar los precios
- Esto no importa mucho porque el servidor verifica los precios al hacer checkout
- Para máxima seguridad, el server debería recalcular precios en checkout

🔒 **Validación en el Servidor**
- Considera agregar validación de precios en el backend al procesar órdenes
- Compara el precio pagado con el precio base + impuestos + ajustes

---

## Soporte

Si tienes preguntas sobre cómo funcionan los precios dinámicos, busca el botón 🔌 en la esquina inferior izquierda de la pantalla para ver el análisis completo de tu dispositivo.
