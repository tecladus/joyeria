import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import TarjetaProducto from '../components/TarjetaProducto';
import { agregarAlCarrito } from '../services/api';
import { setCantidadCarrito } from '../redux/slices/carritoSlice';

function Favoritos() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const favoritos = useSelector((state) => state.favoritos.items || []);

  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  // Hacer scroll hacia arriba al montar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Auto-cerrar mensaje de error o toast después de 5 segundos
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleAgregarCarrito = async (productoId) => {
    if (!auth?.token || !auth?.idUsuario) {
      navigate('/login');
      return;
    }
    try {
      const carritoActualizado = await agregarAlCarrito(auth.idUsuario, productoId, 1);
      const nuevoTotal = carritoActualizado?.items?.reduce((s, i) => s + i.cantidad, 0) || 0;
      dispatch(setCantidadCarrito(nuevoTotal));
      setToast('Producto agregado al carrito con éxito');
    } catch (err) {
      setError(err.message || 'Error al agregar al carrito');
    }
  };

  return (
    <div className="min-h-screen pb-20 pt-32 bg-background text-on-surface">
      <main className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
        
        {/* Encabezado */}
        <section className="mb-12 border-b border-outline-variant/10 pb-8">
          <h1 className="font-display-lg text-3xl md:text-5xl text-on-background mb-4">
            Mis Favoritos
          </h1>
          <p className="font-body-lg text-secondary font-light">
            Guarda tus joyas preferidas para adquirirlas en tu próxima visita al Atelier.
          </p>
        </section>

        {/* Notificaciones */}
        {toast && (
          <div className="bg-success-container/10 border border-success/35 text-success p-4 rounded-xl mb-8 font-body-md text-sm flex justify-between items-center animate-fade-in">
            <span>{toast}</span>
            <button onClick={() => setToast('')} className="bg-transparent border-0 text-success cursor-pointer font-bold font-body-md text-sm pl-2">
              ✕
            </button>
          </div>
        )}

        {error && (
          <div className="bg-error-container border border-error text-on-error-container p-4 rounded-xl mb-8 font-body-md text-sm flex justify-between items-center animate-fade-in">
            <span>{error}</span>
            <button onClick={() => setError('')} className="bg-transparent border-0 text-on-error-container cursor-pointer font-bold font-body-md text-sm pl-2">
              ✕
            </button>
          </div>
        )}

        {/* Listado Principal */}
        {favoritos.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30 max-w-2xl mx-auto px-6">
            <span className="material-symbols-outlined text-4xl text-outline-variant mb-4 block select-none">
              favorite
            </span>
            <h3 className="font-display-lg text-2xl mb-2 text-on-surface">Tu lista de favoritos está vacía</h3>
            <p className="font-body-md text-secondary mb-8 max-w-sm mx-auto">
              Navega por nuestro catálogo de joyas de alta gama y pulsa en el corazón de cualquier pieza para añadirla aquí.
            </p>
            <Link
              to="/productos"
              className="inline-block px-8 py-4 bg-on-surface text-background font-label-caps text-xs tracking-widest uppercase hover:bg-primary hover:text-white transition-all duration-300 rounded-sm"
            >
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-y-12 gap-x-4 sm:gap-x-gutter animate-fade-in">
            {favoritos.map((producto) => (
              <TarjetaProducto
                key={producto.idProducto}
                producto={producto}
                onAgregarCarrito={handleAgregarCarrito}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Favoritos;
