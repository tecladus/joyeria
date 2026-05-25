import { useState, useEffect } from 'react';
import { 
  getUsuarios,
  getTodasLasOrdenes, actualizarEstadoOrden,
  getProductos, eliminarProducto,
  getCategorias
} from '../services/api';

const TABS = [
  { id: 'users', label: 'Lista Usuarios' },
  { id: 'catalog', label: 'Moderación Catálogo' },
  { id: 'orders', label: 'Gestión Órdenes' },
  { id: 'categories', label: 'Categorías' }
];

function PanelModerador({ auth }) {
  const [tabActiva, setTabActiva] = useState('users');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Datos
  const [usuarios, setUsuarios] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);

  const mostrarToast = (mensaje) => {
    setToast(mensaje);
    setTimeout(() => setToast(''), 2500);
  };

  const cargarDatos = async () => {
    setCargando(true);
    setError('');
    try {
      const [usersData, ordersData, productsData, catsData] = await Promise.all([
        getUsuarios(),
        getTodasLasOrdenes(),
        getProductos(),
        getCategorias()
      ]);
      setUsuarios(usersData || []);
      setOrdenes(ordersData || []);
      setProductos(productsData || []);
      setCategorias(catsData || []);
    } catch (err) {
      setError(err.message || 'Error al cargar los datos de moderación.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Handlers Catálogo (Solo eliminación por moderación)
  const handleEliminarProducto = async (id) => {
    if (!window.confirm('¿Desea eliminar esta pieza del catálogo por infracción de políticas?')) return;
    try {
      await eliminarProducto(id, auth.idUsuario);
      mostrarToast('Pieza removida del catálogo por moderador');
      cargarDatos();
    } catch (err) {
      setError(err.message || 'Error al moderar producto.');
    }
  };

  // Handlers Órdenes (Actualización de estado operativa)
  const handleActualizarEstadoOrden = async (id, nuevoEstado) => {
    try {
      await actualizarEstadoOrden(id, nuevoEstado);
      mostrarToast('Estado de la orden actualizado');
      cargarDatos();
    } catch (err) {
      setError(err.message || 'Error al actualizar estado de la orden.');
    }
  };

  return (
    <div className="min-h-screen pb-20 pt-32 bg-background text-on-surface">
      <main className="max-w-7xl mx-auto px-6 md:px-8">
        
        {/* Encabezado */}
        <section className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/10 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display-lg text-3xl md:text-5xl text-on-background">
                Atelier Moderación
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-label-caps tracking-widest bg-warning-container/30 text-warning border border-warning/20 font-semibold uppercase mt-1">
                Moderador
              </span>
            </div>
            <p className="font-body-md text-secondary font-light">
              Auditoría y moderación del Atelier: control de contenido y resolución de estados de órdenes.
            </p>
          </div>
          <button 
            onClick={cargarDatos}
            className="flex items-center gap-2 px-4 py-2 border border-outline/30 hover:border-primary text-secondary hover:text-primary transition-all text-xs font-semibold font-label-caps uppercase bg-transparent"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            Recargar
          </button>
        </section>

        {/* Mensajes Generales */}
        {error && (
          <div className="bg-error-container border border-error text-on-error-container p-4 rounded mb-6 flex justify-between items-center text-sm font-body-md">
            <span>{error}</span>
            <button onClick={() => setError('')} className="bg-transparent border-0 text-error cursor-pointer">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* Navegación por Tabs */}
        <div className="flex border-b border-outline-variant/10 mb-8 overflow-x-auto whitespace-nowrap scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              className={`px-6 py-3 font-label-caps text-xs tracking-wider uppercase transition-colors relative font-semibold bg-transparent border-0 cursor-pointer ${
                tabActiva === tab.id ? 'text-primary' : 'text-secondary hover:text-primary'
              }`}
            >
              {tab.label}
              {tabActiva === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary"></div>
              )}
            </button>
          ))}
        </div>

        {/* Spinner de Carga */}
        {cargando && (
          <div className="text-center py-20">
            <span className="font-label-caps text-label-caps text-primary tracking-widest animate-pulse">
              Accediendo a base de moderación...
            </span>
          </div>
        )}

        {/* Contenido de la Tab */}
        {!cargando && (
          <div>
            
            {/* TABS: Usuarios (Lectura) */}
            {tabActiva === 'users' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-surface-container-low border border-outline-variant/10 p-4 rounded text-xs text-secondary font-body-md">
                  📖 Vista de Auditoría: El rol de moderador tiene acceso de lectura para verificar cuentas y detectar comportamientos inusuales. No tiene permisos de modificación sobre cuentas.
                </div>
                <div className="overflow-x-auto bg-surface-container-lowest border border-outline-variant/20 rounded shadow-sm">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/10 bg-surface-container-low text-[10px] font-label-caps uppercase text-outline font-semibold">
                        <th className="p-4">Usuario</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Rol</th>
                        <th className="p-4">Fecha Creación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 font-body-md">
                      {usuarios.map((u) => (
                        <tr key={u.idUsuario} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className="p-4">
                            <div className="font-semibold">{u.nombre} {u.apellido}</div>
                            <div className="text-xs text-outline">@{u.username}</div>
                          </td>
                          <td className="p-4 text-secondary">{u.email}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-label-caps tracking-wider bg-outline-variant/10 text-on-surface-variant uppercase font-semibold">
                              {u.rol}
                            </span>
                          </td>
                          <td className="p-4 text-outline text-xs">
                            {new Date(u.fechaCreacion).toLocaleDateString('es-AR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TABS: Moderación Catálogo */}
            {tabActiva === 'catalog' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-surface-container-low border border-outline-variant/10 p-4 rounded text-xs text-secondary font-body-md">
                  ⚖️ Control de Catálogo: Puedes dar de baja cualquier publicación que infrinja los términos de calidad y veracidad del Atelier Aura. Los moderadores no pueden editar precios ni stock.
                </div>
                <div className="overflow-x-auto bg-surface-container-lowest border border-outline-variant/20 rounded shadow-sm">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/10 bg-surface-container-low text-[10px] font-label-caps uppercase text-outline font-semibold">
                        <th className="p-4">Imagen</th>
                        <th className="p-4">Pieza</th>
                        <th className="p-4">Categoría</th>
                        <th className="p-4">Vendedor</th>
                        <th className="p-4 text-right">Precio</th>
                        <th className="p-4 text-center">Stock</th>
                        <th className="p-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 font-body-md">
                      {productos.map((p) => (
                        <tr key={p.idProducto} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className="p-4">
                            <img
                              src={p.imagenUrl || 'https://via.placeholder.com/150'}
                              alt={p.nombre}
                              className="w-12 h-12 object-cover rounded-sm border border-outline-variant/20"
                            />
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-on-surface">{p.nombre}</div>
                            <div className="text-xs text-outline line-clamp-1 max-w-xs">{p.descripcion}</div>
                          </td>
                          <td className="p-4 text-secondary">{p.categoria}</td>
                          <td className="p-4 text-secondary text-xs">{p.vendedor}</td>
                          <td className="p-4 text-right font-semibold">
                            ${p.precio?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 text-center">
                            <span className="text-secondary text-xs">{p.stock} u</span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleEliminarProducto(p.idProducto)}
                              className="text-error hover:underline text-xs uppercase tracking-wider font-semibold bg-transparent border-0 cursor-pointer"
                            >
                              Remover
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TABS: Gestión Órdenes */}
            {tabActiva === 'orders' && (
              <div className="space-y-6 animate-fade-in">
                <div className="overflow-x-auto bg-surface-container-lowest border border-outline-variant/20 rounded shadow-sm">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/10 bg-surface-container-low text-[10px] font-label-caps uppercase text-outline font-semibold">
                        <th className="p-4">Orden</th>
                        <th className="p-4">Cliente</th>
                        <th className="p-4">Fecha</th>
                        <th className="p-4">Detalle</th>
                        <th className="p-4 text-right">Total</th>
                        <th className="p-4 text-center">Estado Operativo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 font-body-md">
                      {ordenes.map((o) => (
                        <tr key={o.idOrden} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className="p-4 font-semibold text-primary">#{o.idOrden}</td>
                          <td className="p-4 font-semibold text-on-surface">{o.usuario}</td>
                          <td className="p-4 text-secondary text-xs font-body-md">
                            {new Date(o.fecha).toLocaleDateString('es-AR')}
                          </td>
                          <td className="p-4 text-xs text-secondary">
                            <ul className="list-disc pl-4 space-y-1">
                              {o.detalles?.map((det) => (
                                <li key={det.idDetalle}>{det.nombreProducto} ({det.cantidad}u)</li>
                              ))}
                            </ul>
                          </td>
                          <td className="p-4 text-right font-semibold">
                            ${o.total?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4 text-center">
                            <select
                              value={o.estado}
                              onChange={(e) => handleActualizarEstadoOrden(o.idOrden, e.target.value)}
                              className={`bg-transparent border rounded px-2.5 py-1 text-[11px] font-label-caps font-semibold uppercase tracking-wider text-center cursor-pointer ${
                                o.estado === 'ENTREGADO' 
                                  ? 'border-success text-success bg-success-container/10' 
                                  : o.estado === 'CANCELADO' 
                                  ? 'border-error text-error bg-error-container/10' 
                                  : 'border-warning text-warning bg-warning-container/10'
                              }`}
                            >
                              <option value="PENDIENTE" className="bg-background text-on-surface">PENDIENTE</option>
                              <option value="ENTREGADO" className="bg-background text-on-surface">ENTREGADO</option>
                              <option value="CANCELADO" className="bg-background text-on-surface">CANCELADO</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TABS: Categorías (Lectura) */}
            {tabActiva === 'categories' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-surface-container-low border border-outline-variant/10 p-4 rounded text-xs text-secondary font-body-md">
                  📖 Vista de Categorías: Muestra las divisiones activas en el Atelier. El moderador no puede crear ni borrar categorías.
                </div>
                <div className="overflow-x-auto bg-surface-container-lowest border border-outline-variant/20 rounded shadow-sm max-w-xl">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/10 bg-surface-container-low text-[10px] font-label-caps uppercase text-outline font-semibold">
                        <th className="p-4">ID</th>
                        <th className="p-4">Nombre de Categoría</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 font-body-md">
                      {categorias.map((c) => (
                        <tr key={c.idCategoria} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className="p-4 text-secondary text-xs">#{c.idCategoria}</td>
                          <td className="p-4 font-semibold text-on-surface">{c.nombre}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 bg-on-surface text-background px-6 py-4 rounded shadow-2xl font-label-caps text-[11px] tracking-widest uppercase border border-outline-variant/30 animate-fade-in flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-sm">done</span>
          {toast}
        </div>
      )}
    </div>
  );
}

export default PanelModerador;
