import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrdenes } from '../redux/slices/ordenesSlice';

function HistorialCompras() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const { items: rawOrdenes, cargando, error: errorOrdenes } = useSelector((state) => state.ordenes);
  
  const [error, setError] = useState('');
  const [ordenAbierta, setOrdenAbierta] = useState(null);
  const [infoMessage, setInfoMessage] = useState('');

  const ordenes = useMemo(() => {
    return [...rawOrdenes].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [rawOrdenes]);

  // Sincronizar error de Redux con estado local
  useEffect(() => {
    if (errorOrdenes) {
      setError(errorOrdenes);
    }
  }, [errorOrdenes]);

  // Auto-cerrar mensaje de éxito después de 5 segundos
  useEffect(() => {
    if (infoMessage) {
      const timer = setTimeout(() => {
        setInfoMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [infoMessage]);

  // Auto-cerrar mensaje de error después de 5 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (auth?.idUsuario) {
      dispatch(fetchOrdenes(auth.idUsuario));
    }
  }, [auth?.idUsuario, dispatch]);

  const toggleDetalle = (id) => {
    setOrdenAbierta(ordenAbierta === id ? null : id);
  };

  const getBadgeClass = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'ENTREGADO':
        return 'bg-success-container/30 text-success border border-success/30';
      case 'CANCELADO':
        return 'bg-error-container/30 text-error border border-error/30';
      case 'PENDIENTE':
      default:
        return 'bg-warning-container/30 text-warning border border-warning/30';
    }
  };

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const date = new Date(fechaStr);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen pb-20 pt-32 bg-background text-on-surface">
      <main className="max-w-4xl mx-auto px-6 md:px-8">
        
        {/* Encabezado */}
        <section className="mb-12 border-b border-outline-variant/10 pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="font-display-lg text-3xl md:text-5xl text-on-background mb-4">
              Mis Compras
            </h1>
            <p className="font-body-lg text-secondary font-light">
              Aquí puedes ver el historial de todas las órdenes exclusivas que has adquirido en Aura.
            </p>
          </div>
        </section>

        {/* Mensajes de carga, éxito o error */}
        {cargando && (
          <div className="text-center py-20">
            <p className="font-label-caps text-label-caps text-primary tracking-widest animate-pulse">
              Cargando historial de compras...
            </p>
          </div>
        )}

        {infoMessage && (
          <div className="bg-success-container/10 border border-success/35 text-success p-4 rounded-xl mb-8 font-body-md text-sm flex justify-between items-center animate-fade-in">
            <span>{infoMessage}</span>
            <button onClick={() => setInfoMessage('')} className="bg-transparent border-0 text-success cursor-pointer font-bold font-body-md text-sm pl-2">
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
        {!cargando && !error && (
          <>
            {ordenes.length === 0 ? (
              <div className="text-center py-20 bg-surface-container-low rounded border border-dashed border-outline-variant/30">
                <span className="material-symbols-outlined text-4xl text-outline-variant mb-4 block">
                  shopping_bag
                </span>
                <p className="font-body-md text-secondary text-sm mb-6">
                  Aún no has realizado ninguna compra en el Atelier.
                </p>
                <Link
                  to="/productos"
                  className="inline-block px-6 py-3 bg-on-surface text-background font-label-caps text-xs tracking-widest uppercase hover:bg-primary hover:text-white transition-all duration-300"
                >
                  Explorar Catálogo
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {ordenes.map((orden) => {
                  const estaAbierta = ordenAbierta === orden.idOrden;
                  return (
                    <div 
                      key={orden.idOrden} 
                      className="bg-surface-container-lowest border border-outline-variant/20 rounded-md overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      {/* Cabecera de la Orden */}
                      <div 
                        onClick={() => toggleDetalle(orden.idOrden)}
                        className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-surface-container-low/40 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-label-caps text-xs font-semibold text-primary">
                              Orden #{orden.idOrden}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-label-caps tracking-wider uppercase font-semibold ${getBadgeClass(orden.estado)}`}>
                              {orden.estado}
                            </span>
                          </div>
                          <p className="text-xs text-outline font-body-md">
                            {formatFecha(orden.fecha)}
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between md:justify-end gap-6">
                          <div className="text-right">
                            <span className="text-[10px] font-label-caps text-outline block uppercase tracking-wider">
                              Total
                            </span>
                            <span className="font-body-lg text-lg font-semibold text-on-surface">
                              ${orden.total?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <span className={`material-symbols-outlined text-outline transition-transform duration-300 ${estaAbierta ? 'rotate-180' : ''}`}>
                            expand_more
                          </span>
                        </div>
                      </div>

                      {/* Detalles de la Orden */}
                      {estaAbierta && (
                        <div className="border-t border-outline-variant/10 bg-surface-container-low/20 p-6 animate-fade-in">
                          <h4 className="font-label-caps text-[10px] text-outline uppercase tracking-widest mb-4 font-semibold">
                            Detalle de Productos
                          </h4>
                          <div className="divide-y divide-outline-variant/10">
                            {orden.detalles?.map((detalle) => (
                              <div key={detalle.idDetalle} className="py-4 flex justify-between items-center text-sm">
                                <div className="space-y-1">
                                  <p className="font-medium text-on-surface font-body-md">
                                    {detalle.nombreProducto}
                                  </p>
                                  <p className="text-xs text-outline font-body-md">
                                    Cantidad: {detalle.cantidad} × ${detalle.precioUnitario?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                                <span className="font-semibold text-on-surface font-body-md">
                                  ${detalle.subtotal?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            ))}
                          </div>
                          
                          {/* Envío y Pago */}
                          {(orden.metodoPago || orden.direccion) && (
                            <div className="mt-6 pt-6 border-t border-outline-variant/15 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-body-md bg-surface-container-low/40 p-4 rounded">
                              {orden.metodoPago && (
                                <div>
                                  <span className="font-label-caps text-[10px] text-outline uppercase tracking-wider block mb-1">Método de Pago</span>
                                  <span className="text-on-surface capitalize font-medium">{orden.metodoPago}</span>
                                </div>
                              )}
                              {orden.direccion && (
                                <div>
                                  <span className="font-label-caps text-[10px] text-outline uppercase tracking-wider block mb-1">Detalles de Envío</span>
                                  <span className="text-on-surface block font-medium">{orden.nombreCompleto}</span>
                                  <span className="text-secondary block font-light">{orden.direccion}, {orden.ciudad} (CP {orden.codigoPostal})</span>
                                  <span className="text-secondary block font-light">Tel: {orden.telefono}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Pie del Detalle */}
                          <div className="mt-6 pt-4 border-t border-outline-variant/10 flex justify-between items-center text-xs">
                            <span className="font-body-md text-outline">
                              Compra realizada mediante plataforma segura de Aura.
                            </span>
                            <span className="font-label-caps text-outline uppercase">
                              {orden.detalles?.length || 0} items
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default HistorialCompras;
