import { useState } from 'react';

const formatearPrecio = (precio) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(precio);

function CarritoItem({ item, onCambiarCantidad, onEliminar, cargando }) {
  const [errorImagen, setErrorImagen] = useState(false);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-6 border-b border-outline-variant/10 text-on-surface">
      {/* Izquierda: Imagen y Detalle */}
      <div className="flex items-center gap-4 flex-grow">
        {item.imagenUrl && !errorImagen ? (
          <img
            src={item.imagenUrl}
            alt={item.nombreProducto}
            className="w-20 h-24 object-cover border border-outline-variant/10 rounded"
            onError={() => setErrorImagen(true)}
          />
        ) : (
          <div className="w-20 h-24 bg-surface-container-low border border-outline-variant/10 flex items-center justify-center text-xl text-outline-variant rounded select-none">
            ◇
          </div>
        )}
        
        <div className="space-y-1">
          <h4 className="font-body-md font-medium text-on-surface text-base">
            {item.nombreProducto}
          </h4>
          <p className="font-body-md text-sm text-secondary">
            {formatearPrecio(item.precioUnitario)} c/u
          </p>
        </div>
      </div>

      {/* Centro/Derecha: Controles, Subtotal y Acción */}
      <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto">
        {/* Selector de Cantidad */}
        <div className="flex items-center border border-outline-variant/20 rounded">
          <button
            className="w-10 h-10 flex items-center justify-center font-light hover:text-primary transition-colors disabled:opacity-30"
            disabled={item.cantidad <= 1 || cargando}
            onClick={() => onCambiarCantidad(item.idItem, item.cantidad - 1)}
            aria-label="Disminuir cantidad"
          >
            —
          </button>
          <span className="w-10 text-center font-body-md text-sm font-medium">
            {item.cantidad}
          </span>
          <button
            className="w-10 h-10 flex items-center justify-center font-light hover:text-primary transition-colors disabled:opacity-30"
            disabled={cargando}
            onClick={() => onCambiarCantidad(item.idItem, item.cantidad + 1)}
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>

        {/* Subtotal */}
        <div className="w-28 text-right font-body-md font-semibold text-primary">
          {formatearPrecio(item.subtotal)}
        </div>

        {/* Botón Eliminar */}
        <button
          className="text-outline hover:text-error transition-colors p-2 disabled:opacity-30"
          onClick={() => onEliminar(item.idItem)}
          disabled={cargando}
          aria-label="Eliminar del carrito"
        >
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>
    </div>
  );
}

export default CarritoItem;
