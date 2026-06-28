/*
 * Carteles de urgencia / escasez para incentivar la compra.
 *
 * Son DOS carteles independientes (pueden aparecer juntos en un mismo producto):
 *
 *   1. Escasez (rojo, AUTOMÁTICO): aparece solo cuando el stock real es > 0 y <= UMBRAL_STOCK_BAJO.
 *      Siempre muestra el stock real (ej. "¡Solo quedan 3!"), nunca un número fijo.
 *
 *   2. Sello promocional (cinta superior, MANUAL): lo asigna el vendedor/admin a cada producto
 *      (MUY_SOLICITADO o EDICION_LIMITADA). Si no hay sello manual pero el producto tiene
 *      descuento, cae al aviso de "Oferta por tiempo limitado".
 */

// Umbral de "pocas unidades": el cartel rojo aparece con stock <= a este valor (y > 0).
export const UMBRAL_STOCK_BAJO = 5;

// Opciones para los <select> de los paneles de admin / vendedor.
export const SELLOS_URGENCIA = [
  { value: 'NINGUNO', label: 'Ninguno' },
  { value: 'MUY_SOLICITADO', label: 'Muy solicitado' },
  { value: 'EDICION_LIMITADA', label: 'Edición limitada' },
];

/*
 * Cartel ROJO de escasez (automático).
 * Devuelve null salvo que el stock real sea > 0 y <= UMBRAL_STOCK_BAJO.
 * El texto usa el stock real del producto.
 */
export function obtenerBadgeEscasez(producto) {
  if (!producto) return null;

  const stock = Number(producto.stock) || 0;
  if (stock > 0 && stock <= UMBRAL_STOCK_BAJO) {
    return {
      texto: stock === 1 ? '¡Última unidad!' : `¡Solo quedan ${stock}!`,
      icono: 'local_fire_department',
      clases: 'bg-error-container/90 text-on-error-container border-error/30',
    };
  }
  return null;
}

/*
 * Cartel PROMOCIONAL (cinta superior). Lo controla el vendedor con el sello manual.
 * Prioridad:
 *   1. Edición limitada (sello manual)
 *   2. Muy solicitado (sello manual)
 *   3. Oferta por tiempo limitado (si hay descuento y no hay sello manual)
 */
export function obtenerSelloPromo(producto) {
  if (!producto) return null;

  const sello = producto.selloUrgencia || 'NINGUNO';
  const descuento = Number(producto.descuento) || 0;

  if (sello === 'EDICION_LIMITADA') {
    return {
      texto: 'Edición limitada',
      icono: 'diamond',
      clases: 'bg-on-surface/90 text-background border-transparent',
    };
  }

  if (sello === 'MUY_SOLICITADO') {
    return {
      texto: 'Muy solicitado',
      icono: 'trending_up',
      clases: 'bg-primary/90 text-on-primary border-transparent',
    };
  }

  if (descuento > 0) {
    return {
      texto: 'Oferta por tiempo limitado',
      icono: 'schedule',
      clases: 'bg-primary/10 text-primary border-primary/25',
    };
  }

  return null;
}
