/*
 * Mensajes de urgencia / escasez para incentivar la compra.
 *
 * Combina dos fuentes:
 *   - Automática: stock real bajo y descuento activo (siempre verídico).
 *   - Manual: el sello que el vendedor/admin asigna al producto (MUY_SOLICITADO, EDICION_LIMITADA).
 *
 * Se muestra UN solo mensaje por producto, según la prioridad de abajo, para no saturar la tarjeta.
 */

// Umbral de "pocas unidades": stock <= a este valor (y > 0) muestra el aviso de escasez real.
export const UMBRAL_STOCK_BAJO = 5;

// Opciones para los <select> de los paneles de admin / vendedor.
export const SELLOS_URGENCIA = [
  { value: 'NINGUNO', label: 'Ninguno' },
  { value: 'MUY_SOLICITADO', label: 'Muy solicitado' },
  { value: 'EDICION_LIMITADA', label: 'Edición limitada' },
];

/*
 * Devuelve el mensaje de urgencia a mostrar para un producto, o null si no corresponde.
 * El objeto devuelto trae: { texto, icono, clases } donde:
 *   - texto:  string a mostrar.
 *   - icono:  nombre de un Material Symbol.
 *   - clases: clases de color/borde (Tailwind con tokens del proyecto). El layout/tamaño
 *             lo agrega cada componente para adaptarse a la tarjeta o al detalle.
 */
export function obtenerMensajeUrgencia(producto) {
  if (!producto) return null;

  const stock = Number(producto.stock) || 0;
  const descuento = Number(producto.descuento) || 0;
  const sello = producto.selloUrgencia || 'NINGUNO';

  // 1. Escasez real por stock bajo: es lo más honesto y lo más urgente, gana sobre el resto.
  if (stock > 0 && stock <= UMBRAL_STOCK_BAJO) {
    return {
      texto: stock === 1 ? '¡Última unidad!' : `¡Solo quedan ${stock}!`,
      icono: 'local_fire_department',
      clases: 'bg-error-container/85 text-on-error-container border-error/20',
    };
  }

  // 2. Edición limitada (sello manual): sello premium de exclusividad.
  if (sello === 'EDICION_LIMITADA') {
    return {
      texto: 'Edición limitada',
      icono: 'diamond',
      clases: 'bg-on-surface/90 text-background border-transparent',
    };
  }

  // 3. Muy solicitado (sello manual): prueba social.
  if (sello === 'MUY_SOLICITADO') {
    return {
      texto: 'Muy solicitado',
      icono: 'trending_up',
      clases: 'bg-primary/90 text-on-primary border-transparent',
    };
  }

  // 4. Oferta por tiempo limitado: cuando hay un descuento activo.
  if (descuento > 0) {
    return {
      texto: 'Oferta por tiempo limitado',
      icono: 'schedule',
      clases: 'bg-primary/10 text-primary border-primary/25',
    };
  }

  return null;
}
