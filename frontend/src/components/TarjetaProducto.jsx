import { useNavigate } from 'react-router-dom';

/* Formatea un número como precio en dólares */
const formatearPrecio = (precio) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(precio);

/* Calcula el precio con descuento aplicado */
const precioConDescuento = (precio, descuento) => {
  if (!descuento || descuento <= 0) return null;
  return precio * (1 - descuento / 100);
};

function TarjetaProducto({ producto, auth, onAgregarCarrito }) {
  const navigate = useNavigate();
  const puedeAgregarAlCarrito = auth?.rol === 'COMPRADOR' && auth?.token;
  const sinStock = !producto.stock || producto.stock <= 0;
  const precioFinal = precioConDescuento(producto.precio, producto.descuento);

  return (
    <article 
      className="group cursor-pointer flex flex-col"
      onClick={() => navigate(`/productos/${producto.idProducto}`)}
    >
      {/* Contenedor de la Imagen */}
      <div className="relative overflow-hidden aspect-[4/5] bg-gradient-to-br from-surface-container via-surface-container-low to-surface-container border border-outline-variant/10 transition-all duration-700 ease-in-out">
        {producto.imagenUrl && (
          <img
            src={producto.imagenUrl}
            alt={producto.nombre}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              e.style.display = 'none';
            }}
          />
        )}
        <div
          className="absolute inset-0 w-full h-full bg-surface-container flex items-center justify-center text-5xl text-outline-variant/20 font-light"
          id={`fallback-${producto.idProducto}`}
        >
          ◇
        </div>

        {/* Badges superiores */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {producto.descuento > 0 && (
            <span className="px-3 py-1 font-label-caps text-[10px] border border-error/20 text-error backdrop-blur-md bg-white/60">
              -{producto.descuento}%
            </span>
          )}
          {sinStock && (
            <span className="px-3 py-1 font-label-caps text-[10px] border border-outline-variant/30 text-secondary backdrop-blur-md bg-white/60">
              Sin stock
            </span>
          )}
        </div>

        {/* Botón de añadir a la bolsa en hover (Solo para compradores o invitados que puedan loguearse) */}
        <button
          disabled={sinStock || (auth?.token && !puedeAgregarAlCarrito)}
          onClick={(e) => {
            e.stopPropagation();
            if (!auth?.token) {
              navigate('/login');
              return;
            }
            onAgregarCarrito && onAgregarCarrito(producto.idProducto);
          }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-on-surface text-background px-8 py-3 font-label-caps text-[11px] whitespace-nowrap tracking-wider hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {sinStock ? 'Sin stock' : 'Añadir al carrito'}
        </button>
      </div>

      {/* Información del Producto */}
      <div className="mt-6 flex-grow flex flex-col justify-between">
        <div>
          {producto.categoria && (
            <span className="font-label-caps text-[10px] tracking-widest text-outline uppercase block mb-1">
              {producto.categoria}
            </span>
          )}
          <h4 className="font-body-md text-on-surface group-hover:text-primary transition-colors duration-300 font-medium">
            {producto.nombre}
          </h4>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-body-md text-on-surface font-semibold">
            {formatearPrecio(precioFinal ?? producto.precio)}
          </span>
          {precioFinal && (
            <span className="font-body-md text-secondary line-through text-xs">
              {formatearPrecio(producto.precio)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default TarjetaProducto;
