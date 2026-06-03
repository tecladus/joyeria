import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { adjustPriceByDevice, useDeviceMultiplier } from '../services/deviceDetection';
import { toggleFavorito } from '../redux/slices/favoritosSlice';

/* Formatea un número como precio en dólares */
const formatearPrecio = (precio) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(precio);

/* Calcula el precio con descuento aplicado */
const precioConDescuento = (precio, descuento) => {
  if (!descuento || descuento <= 0) return null;
  return precio * (1 - descuento / 100);
};

function TarjetaProducto({ producto, onAgregarCarrito }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const favoritos = useSelector((state) => state.favoritos.items || []);
  const esFavorito = favoritos.some((item) => item.idProducto === producto.idProducto);
  const [errorImagen, setErrorImagen] = useState(false);
  const deviceMultiplier = useDeviceMultiplier();
  const puedeAgregarAlCarrito = !!auth?.token;
  const sinStock = !producto.stock || producto.stock <= 0;

  // Calcular precio con descuento primero, luego ajustar por dispositivo
  const precioConDesc = precioConDescuento(producto.precio, producto.descuento);
  const precioBase = precioConDesc ?? producto.precio;
  const precioAjustado = adjustPriceByDevice(precioBase);
  const precioOriginalAjustado = adjustPriceByDevice(producto.precio);
  const precioFinal = precioAjustado;

  return (
    <article 
      className="group cursor-pointer flex flex-col"
      onClick={() => navigate(`/productos/${producto.idProducto}`)}
    >
      {/* Contenedor de la Imagen */}
      <div className="relative overflow-hidden aspect-[4/5] bg-gradient-to-br from-surface-container via-surface-container-low to-surface-container border border-outline-variant/10 transition-all duration-700 ease-in-out">
        {producto.imagenUrl && !errorImagen ? (
          <img
            src={producto.imagenUrl}
            alt={producto.nombre}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={() => {
              setErrorImagen(true);
            }}
          />
        ) : (
          <div
            className="absolute inset-0 w-full h-full bg-surface-container flex items-center justify-center text-5xl text-outline-variant/20 font-light"
            id={`fallback-${producto.idProducto}`}
          >
            ◇
          </div>
        )}

        {/* Botón de Favorito */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!auth?.token) {
              navigate('/login');
              return;
            }
            dispatch(toggleFavorito(producto));
          }}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-surface-container-lowest/70 backdrop-blur-md border border-outline-variant/10 flex items-center justify-center cursor-pointer text-on-surface hover:scale-105 transition-all duration-300 shadow-sm"
          title={esFavorito ? 'Quitar de Favoritos' : 'Añadir a Favoritos'}
        >
          <span 
            className="material-symbols-outlined text-lg"
            style={esFavorito ? { fontVariationSettings: '"FILL" 1', color: '#e53e3e' } : {}}
          >
            favorite
          </span>
        </button>

        {/* Badges superiores */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {producto.descuento > 0 && (
            <span className="px-3 py-1 font-label-caps text-[10px] border border-error/20 text-error backdrop-blur-md bg-surface-container-lowest/60">
              -{producto.descuento}%
            </span>
          )}
          {sinStock && (
            <span className="px-3 py-1 font-label-caps text-[10px] border border-outline-variant/30 text-secondary backdrop-blur-md bg-surface-container-lowest/60">
              Sin stock
            </span>
          )}
        </div>

        <button
          disabled={sinStock || (auth?.token && !puedeAgregarAlCarrito)}
          onClick={(e) => {
            e.stopPropagation();
            if (!auth?.token) {
              navigate('/login');
              return;
            }
            const cat = (producto.categoria || '').trim().toLowerCase();
            const esAnillo = cat === 'anillos' || cat === 'rings';
            if (esAnillo) {
              navigate(`/productos/${producto.idProducto}`);
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
            {formatearPrecio(precioFinal)}
          </span>
          {precioConDesc && (
            <span className="font-body-md text-secondary line-through text-xs">
              {formatearPrecio(precioOriginalAjustado)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default TarjetaProducto;
