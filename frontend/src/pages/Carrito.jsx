import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCarrito, modificarCantidadItem, eliminarDelCarrito, hacerCheckout } from '../services/api';
import CarritoItem from '../components/CarritoItem';

const formatearPrecio = (precio) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(precio);

function Carrito({ auth, onActualizarCarrito }) {
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [operando, setOperando] = useState(false);
  const [error, setError] = useState('');
  const [checkoutExitoso, setCheckoutExitoso] = useState(false);

  const cargarCarrito = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const datos = await getCarrito(auth.idUsuario);
      setCarrito(datos);
      const total = datos?.items?.reduce((s, i) => s + i.cantidad, 0) || 0;
      onActualizarCarrito(total);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el carrito.');
    } finally {
      setCargando(false);
    }
  }, [auth.idUsuario, onActualizarCarrito]);

  useEffect(() => {
    cargarCarrito();
  }, [cargarCarrito]);

  const handleCambiarCantidad = async (itemId, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    setOperando(true);
    setError('');
    try {
      const actualizado = await modificarCantidadItem(itemId, auth.idUsuario, nuevaCantidad);
      setCarrito(actualizado);
      const total = actualizado?.items?.reduce((s, i) => s + i.cantidad, 0) || 0;
      onActualizarCarrito(total);
    } catch (err) {
      setError(err.message || 'Error al modificar la cantidad.');
    } finally {
      setOperando(false);
    }
  };

  const handleEliminar = async (itemId) => {
    setOperando(true);
    setError('');
    try {
      const actualizado = await eliminarDelCarrito(itemId, auth.idUsuario);
      if (actualizado) {
        setCarrito(actualizado);
        const total = actualizado?.items?.reduce((s, i) => s + i.cantidad, 0) || 0;
        onActualizarCarrito(total);
      } else {
        await cargarCarrito();
      }
    } catch (err) {
      setError(err.message || 'Error al eliminar el producto.');
    } finally {
      setOperando(false);
    }
  };

  const handleCheckout = async () => {
    setOperando(true);
    setError('');
    try {
      await hacerCheckout(auth.idUsuario);
      setCheckoutExitoso(true);
      onActualizarCarrito(0);
    } catch (err) {
      setError(err.message || 'Error al procesar el pedido.');
    } finally {
      setOperando(false);
    }
  };

  const items = carrito?.items || [];
  const total = carrito?.total || 0;
  const cantidadItems = items.reduce((s, i) => s + i.cantidad, 0);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-label-caps text-label-caps text-primary tracking-widest animate-pulse">
          Abriendo tu bolsa de compras...
        </p>
      </div>
    );
  }

  return (
    <main className="pt-32 pb-section-gap min-h-screen bg-background text-on-surface">
      <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
        
        {/* Encabezado */}
        <div className="border-b border-outline-variant/10 pb-6 mb-12">
          <h1 className="font-display-lg text-4xl md:text-5xl text-on-surface mb-2">Bolsa de Compras</h1>
          <p className="font-body-md text-sm text-secondary">
            {cantidadItems > 0
              ? `${cantidadItems} ${cantidadItems === 1 ? 'pieza seleccionada' : 'piezas seleccionadas'}`
              : 'Tu bolsa de compras está vacía'}
          </p>
        </div>

        {error && (
          <div className="bg-error-container border border-error text-on-error-container p-4 rounded-xl mb-8 font-body-md">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30 text-center max-w-2xl mx-auto px-6">
            <div className="w-16 h-16 bg-surface-container flex items-center justify-center rounded-full text-2xl text-outline-variant mb-6 select-none">
              ◇
            </div>
            <h3 className="font-display-lg text-2xl mb-2 text-on-surface">Tu bolsa está vacía</h3>
            <p className="font-body-md text-secondary mb-8 max-w-sm">
              Explora nuestra colección exclusiva de joyería ética y encuentra una pieza atemporal para ti.
            </p>
            <Link 
              to="/productos" 
              className="inline-block px-10 py-5 bg-on-surface text-background font-label-caps text-label-caps hover:bg-primary transition-all duration-300 uppercase tracking-widest"
            >
              Explorar Colección
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* Lista de Items */}
            <div className="lg:col-span-2 space-y-2">
              <div className="border-t border-outline-variant/10">
                {items.map((item) => (
                  <CarritoItem
                    key={item.idItem}
                    item={item}
                    onCambiarCantidad={handleCambiarCantidad}
                    onEliminar={handleEliminar}
                    cargando={operando}
                  />
                ))}
              </div>
            </div>

            {/* Panel de Resumen (Sticky) */}
            <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 space-y-6 lg:sticky lg:top-28">
              <h3 className="font-label-caps text-label-caps text-on-surface tracking-widest uppercase">
                Resumen del Pedido
              </h3>

              <div className="space-y-4 text-sm font-body-md text-secondary border-b border-outline-variant/10 pb-6">
                <div className="flex justify-between items-center">
                  <span>Subtotal ({cantidadItems} artículos)</span>
                  <span className="text-on-surface">{formatearPrecio(total)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Envío internacional</span>
                  <span className="text-primary-container font-medium uppercase tracking-widest text-[11px]">A confirmar</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-base font-semibold text-on-surface">
                <span>Total Estimado</span>
                <span className="font-display-lg text-xl text-primary">{formatearPrecio(total)}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={operando || items.length === 0}
                className="w-full py-5 bg-on-surface text-background font-label-caps text-label-caps hover:bg-primary transition-all duration-300 disabled:opacity-50 disabled:hover:bg-on-surface disabled:cursor-not-allowed uppercase tracking-widest text-center block"
              >
                {operando ? 'Confirmando...' : 'Proceder al Pago'}
              </button>

              <div className="pt-2 text-center text-[10px] font-label-caps text-outline tracking-widest uppercase flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Compra 100% Segura · Stock Garantizado
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Modal de Checkout Exitoso */}
      {checkoutExitoso && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-outline-variant/20 max-w-md w-full p-8 text-center rounded-xl luxury-shadow space-y-6 animate-scale-up">
            <div className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto text-3xl font-light">
              ◆
            </div>
            
            <div className="space-y-2">
              <h2 className="font-display-lg text-2xl md:text-3xl text-on-surface">¡Pedido Confirmado!</h2>
              <p className="font-body-md text-secondary leading-relaxed text-sm">
                Tu solicitud de compra ha sido procesada con éxito. Un correo electrónico de confirmación con los detalles del envío será enviado en breve.
              </p>
            </div>

            <button
              onClick={() => {
                setCheckoutExitoso(false);
                navigate('/productos');
              }}
              className="w-full py-4 bg-on-surface text-background font-label-caps text-label-caps hover:bg-primary transition-all duration-300 uppercase tracking-widest"
            >
              Seguir Comprando
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Carrito;
