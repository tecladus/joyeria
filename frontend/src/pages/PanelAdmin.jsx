import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useModal } from '../components/ModalContext';
import { fetchUsuarios, cambiarRolUsuarioExistente, eliminarUsuarioExistente } from '../redux/slices/usuariosSlice';
import { fetchTodasLasOrdenes, actualizarEstadoOrdenExistente } from '../redux/slices/ordenesSlice';
import { fetchProductos, editarProductoExistente, eliminarProductoExistente } from '../redux/slices/productosSlice';
import { fetchCategorias, crearNuevaCategoria, editarCategoriaExistente, eliminarCategoriaExistente } from '../redux/slices/categoriasSlice';

const TABS = [
  { id: 'metrics', label: 'Métricas' },
  { id: 'users', label: 'Usuarios' },
  { id: 'catalog', label: 'Catálogo' },
  { id: 'orders', label: 'Órdenes' },
  { id: 'categories', label: 'Categorías' }
];

const ROLES = [
  { id: 1, label: 'COMPRADOR' },
  { id: 2, label: 'VENDEDOR' },
  { id: 3, label: 'ADMIN' },
  { id: 4, label: 'MODERATOR' }
];

function PanelAdmin() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const { showConfirm } = useModal();
  const [tabActiva, setTabActiva] = useState('metrics');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Consumir datos de Redux Slices
  const { items: usuarios, cargando: cargandoUsuarios } = useSelector((state) => state.usuarios);
  const { todasLasOrdenes: ordenes, cargando: cargandoOrdenes } = useSelector((state) => state.ordenes);
  const { items: productos, cargando: cargandoProductos } = useSelector((state) => state.productos);
  const { items: categorias, cargando: cargandoCategorias } = useSelector((state) => state.categorias);

  const cargando = cargandoUsuarios || cargandoOrdenes || cargandoProductos || cargandoCategorias;

  // Formulario Categoría
  const [nuevaCatNombre, setNuevaCatNombre] = useState('');

  // Editar Producto Modal/Estado
  const [prodAEditar, setProdAEditar] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editPrecio, setEditPrecio] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editImagenUrl, setEditImagenUrl] = useState('');
  const [editIdCategoria, setEditIdCategoria] = useState('');

  // Editar Categoría en línea
  const [catAEditar, setCatAEditar] = useState(null);
  const [editCatNombre, setEditCatNombre] = useState('');

  const mostrarToast = (mensaje) => {
    setToast(mensaje);
    setTimeout(() => setToast(''), 2500);
  };

  const cargarDatos = async () => {
    setError('');
    try {
      await Promise.all([
        dispatch(fetchUsuarios()).unwrap(),
        dispatch(fetchTodasLasOrdenes()).unwrap(),
        dispatch(fetchProductos()).unwrap(),
        dispatch(fetchCategorias()).unwrap()
      ]);
    } catch (err) {
      setError(err || 'Error al cargar los datos administrativos.');
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [dispatch]);

  // Handlers Usuarios
  const handleCambiarRol = async (id, rolId) => {
    try {
      await dispatch(cambiarRolUsuarioExistente({ id, nuevoRolId: rolId })).unwrap();
      mostrarToast('Rol de usuario actualizado con éxito');
    } catch (err) {
      setError(err.message || 'Error al cambiar rol del usuario.');
    }
  };

  const handleEliminarUsuario = async (id) => {
    const confirmado = await showConfirm('¿Está seguro de que desea eliminar este usuario de forma permanente?', 'Eliminar Usuario');
    if (!confirmado) return;
    try {
      await dispatch(eliminarUsuarioExistente(id)).unwrap();
      mostrarToast('Usuario eliminado correctamente');
    } catch (err) {
      setError(err.message || 'Error al eliminar usuario.');
    }
  };

  // Handlers Catálogo
  const handleEliminarProducto = async (id) => {
    const confirmado = await showConfirm('¿Desea eliminar este producto del catálogo?', 'Eliminar Producto');
    if (!confirmado) return;
    try {
      await dispatch(eliminarProductoExistente({ id, vendedorId: auth.idUsuario })).unwrap();
      mostrarToast('Producto eliminado del catálogo');
    } catch (err) {
      setError(err.message || 'Error al eliminar producto.');
    }
  };

  const abrirEdicionProducto = (prod) => {
    setProdAEditar(prod);
    setEditNombre(prod.nombre || '');
    setEditDescripcion(prod.descripcion || '');
    setEditPrecio(prod.precio || '');
    setEditStock(prod.stock || '');
    setEditImagenUrl(prod.imagenUrl || '');
    setEditIdCategoria(prod.idCategoria || '');
  };

  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    if (!prodAEditar) return;
    try {
      const datosActualizados = {
        nombre: editNombre,
        descripcion: editDescripcion,
        precio: parseFloat(editPrecio),
        descuento: prodAEditar.descuento,
        stock: parseInt(editStock, 10),
        imagenUrl: editImagenUrl || null,
        categoriaId: Number(editIdCategoria)
      };
      await dispatch(editarProductoExistente({ id: prodAEditar.idProducto, vendedorId: auth.idUsuario, datos: datosActualizados })).unwrap();
      mostrarToast('Producto modificado correctamente');
      setProdAEditar(null);
    } catch (err) {
      setError(err.message || 'Error al actualizar producto.');
    }
  };

  // Handlers Órdenes
  const handleActualizarEstadoOrden = async (id, nuevoEstado) => {
    try {
      await dispatch(actualizarEstadoOrdenExistente({ id, estado: nuevoEstado })).unwrap();
      mostrarToast('Estado de la orden actualizado');
    } catch (err) {
      setError(err.message || 'Error al actualizar estado de la orden.');
    }
  };

  // Handlers Categorías
  const handleCrearCategoria = async (e) => {
    e.preventDefault();
    if (!nuevaCatNombre.trim()) return;
    try {
      await dispatch(crearNuevaCategoria({ nombre: nuevaCatNombre.trim() })).unwrap();
      mostrarToast('Nueva categoría creada');
      setNuevaCatNombre('');
    } catch (err) {
      setError(err.message || 'Error al crear categoría.');
    }
  };

  const handleEliminarCategoria = async (id) => {
    const confirmado = await showConfirm('¿Está seguro de que desea eliminar esta categoría?', 'Eliminar Categoría');
    if (!confirmado) return;
    try {
      await dispatch(eliminarCategoriaExistente(id)).unwrap();
      mostrarToast('Categoría eliminada');
    } catch (err) {
      setError(err.message || 'Error al eliminar categoría.');
    }
  };

  const handleGuardarCategoria = async (id) => {
    if (!editCatNombre.trim()) return;
    try {
      await dispatch(editarCategoriaExistente({ id, datos: { nombre: editCatNombre.trim() } })).unwrap();
      mostrarToast('Categoría actualizada correctamente');
      setCatAEditar(null);
    } catch (err) {
      setError(err.message || 'Error al actualizar la categoría.');
    }
  };

  // Métricas
  const totalVentas = ordenes
    .filter(o => o.estado === 'ENTREGADO' || o.estado === 'PENDIENTE')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="min-h-screen pb-20 pt-32 bg-background text-on-surface">
      <main className="max-w-7xl mx-auto px-6 md:px-8">
        
        {/* Encabezado */}
        <section className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant/10 pb-8">
          <div>
            <h1 className="font-display-lg text-3xl md:text-5xl text-on-background mb-2">
              Panel Administrativo
            </h1>
            <p className="font-body-md text-secondary font-light">
              Control central del Atelier Aura: usuarios, catálogo, órdenes y categorías.
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
              Procesando datos del sistema...
            </span>
          </div>
        )}

        {/* Contenido de la Tab */}
        {!cargando && (
          <div>
            
            {/* TABS: Métricas */}
            {tabActiva === 'metrics' && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  
                  <div className="bg-surface-container-low border border-outline-variant/20 p-6 rounded shadow-sm">
                    <span className="text-[10px] font-label-caps text-outline uppercase tracking-wider block mb-2">Ventas Totales</span>
                    <span className="font-display-lg text-2xl font-bold text-on-surface">
                      ${totalVentas.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="bg-surface-container-low border border-outline-variant/20 p-6 rounded shadow-sm">
                    <span className="text-[10px] font-label-caps text-outline uppercase tracking-wider block mb-2">Órdenes Totales</span>
                    <span className="font-display-lg text-2xl font-bold text-on-surface">
                      {ordenes.length}
                    </span>
                  </div>

                  <div className="bg-surface-container-low border border-outline-variant/20 p-6 rounded shadow-sm">
                    <span className="text-[10px] font-label-caps text-outline uppercase tracking-wider block mb-2">Usuarios Registrados</span>
                    <span className="font-display-lg text-2xl font-bold text-on-surface">
                      {usuarios.length}
                    </span>
                  </div>

                  <div className="bg-surface-container-low border border-outline-variant/20 p-6 rounded shadow-sm">
                    <span className="text-[10px] font-label-caps text-outline uppercase tracking-wider block mb-2">Catálogo Activo</span>
                    <span className="font-display-lg text-2xl font-bold text-on-surface">
                      {productos.length} piezas
                    </span>
                  </div>

                </div>

                <div className="bg-surface-container-lowest border border-outline-variant/25 rounded p-6">
                  <h3 className="font-label-caps text-sm tracking-wider uppercase text-on-surface mb-4 font-semibold">Resumen General</h3>
                  <p className="text-sm text-secondary font-body-md leading-relaxed">
                    Este panel contiene toda la información de transacciones y accesos. El sistema mantiene los datos sincronizados mediante el backend REST. Por razones de seguridad, las contraseñas son hasheadas de manera irreversible.
                  </p>
                </div>
              </div>
            )}

            {/* TABS: Usuarios */}
            {tabActiva === 'users' && (
              <div className="overflow-x-auto bg-surface-container-lowest border border-outline-variant/20 rounded shadow-sm animate-fade-in">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/10 bg-surface-container-low text-[10px] font-label-caps uppercase text-outline font-semibold">
                      <th className="p-4">Usuario</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Rol Actual</th>
                      <th className="p-4">Cambiar Rol</th>
                      <th className="p-4 text-right">Acciones</th>
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
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-label-caps tracking-wider bg-outline-variant/20 text-on-surface border border-outline-variant/30 uppercase font-semibold">
                            {u.rol}
                          </span>
                        </td>
                        <td className="p-4">
                          {u.rol === 'ADMIN' ? (
                            <span className="px-2 py-1 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20 uppercase font-semibold">
                              ADMIN
                            </span>
                          ) : (
                            <select
                              value={ROLES.find(r => r.label === u.rol)?.id || 1}
                              onChange={(e) => handleCambiarRol(u.idUsuario, Number(e.target.value))}
                              className="bg-transparent border border-outline-variant/50 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary focus:border-primary text-on-surface cursor-pointer"
                            >
                              {ROLES.filter((rol) => rol.id !== 3).map((rol) => (
                                <option key={rol.id} value={rol.id} className="bg-background text-on-surface">
                                  {rol.label}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleEliminarUsuario(u.idUsuario)}
                            disabled={auth.idUsuario === String(u.idUsuario)} // no auto-eliminarse
                            className="text-error hover:underline text-xs uppercase tracking-wider font-semibold disabled:opacity-30 disabled:cursor-not-allowed bg-transparent border-0 cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TABS: Catálogo */}
            {tabActiva === 'catalog' && (
              <div className="space-y-6 animate-fade-in">
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
                        <th className="p-4 text-right">Acciones</th>
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
                            {p.descuento > 0 && (
                              <span className="text-success text-[10px] block font-light">-{p.descuento}% desc</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${p.stock > 0 ? 'bg-success-container/10 text-success' : 'bg-error-container/10 text-error'}`}>
                              {p.stock} u
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-3">
                            <button
                              onClick={() => abrirEdicionProducto(p)}
                              className="text-primary hover:underline text-xs uppercase tracking-wider font-semibold bg-transparent border-0 cursor-pointer"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleEliminarProducto(p.idProducto)}
                              className="text-error hover:underline text-xs uppercase tracking-wider font-semibold bg-transparent border-0 cursor-pointer"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Modal de edición completo */}
                {prodAEditar && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-background border border-outline-variant/20 rounded shadow-2xl p-8 max-w-md w-full space-y-6">
                      <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
                        <h4 className="font-display-lg text-lg text-on-surface">Editar Pieza</h4>
                        <button onClick={() => setProdAEditar(null)} className="bg-transparent border-0 text-outline hover:text-on-surface cursor-pointer">
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </div>
                      <form onSubmit={handleGuardarProducto} className="space-y-4 font-body-md text-sm">
                        <div>
                          <label className="block text-xs uppercase font-label-caps text-outline mb-1">Nombre</label>
                          <input 
                            type="text" 
                            value={editNombre} 
                            onChange={(e) => setEditNombre(e.target.value)}
                            className="w-full bg-transparent border border-outline/35 rounded p-2 text-on-surface focus:ring-primary focus:border-primary" 
                            required 
                          />
                        </div>
                        <div>
                          <label className="block text-xs uppercase font-label-caps text-outline mb-1">Descripción</label>
                          <textarea 
                            value={editDescripcion} 
                            onChange={(e) => setEditDescripcion(e.target.value)}
                            className="w-full bg-transparent border border-outline/35 rounded p-2 text-on-surface focus:ring-primary focus:border-primary h-20 resize-none" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs uppercase font-label-caps text-outline mb-1">Precio ($)</label>
                            <input 
                              type="number" 
                              min="0"
                              step="0.01" 
                              value={editPrecio} 
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || parseFloat(val) >= 0) setEditPrecio(val);
                              }}
                              className="w-full bg-transparent border border-outline/35 rounded p-2 text-on-surface focus:ring-primary focus:border-primary" 
                              required 
                            />
                          </div>
                          <div>
                            <label className="block text-xs uppercase font-label-caps text-outline mb-1">Stock (u)</label>
                            <input 
                              type="number" 
                              min="0" 
                              value={editStock} 
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === '' || parseInt(val, 10) >= 0) setEditStock(val);
                              }}
                              className="w-full bg-transparent border border-outline/35 rounded p-2 text-on-surface focus:ring-primary focus:border-primary" 
                              required 
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs uppercase font-label-caps text-outline mb-1">Categoría</label>
                          <select
                            value={editIdCategoria}
                            onChange={(e) => setEditIdCategoria(e.target.value)}
                            className="w-full bg-transparent border border-outline/35 rounded p-2 text-on-surface focus:ring-primary focus:border-primary cursor-pointer"
                            required
                          >
                            <option value="" className="bg-background text-on-surface">Seleccionar Categoría</option>
                            {categorias.map((cat) => (
                              <option key={cat.idCategoria} value={cat.idCategoria} className="bg-background text-on-surface">
                                {cat.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs uppercase font-label-caps text-outline mb-1">URL de la Imagen</label>
                          <input 
                            type="url" 
                            value={editImagenUrl} 
                            onChange={(e) => setEditImagenUrl(e.target.value)}
                            className="w-full bg-transparent border border-outline/35 rounded p-2 text-on-surface focus:ring-primary focus:border-primary" 
                          />
                        </div>
                        <div className="pt-4 flex gap-4">
                          <button type="button" onClick={() => setProdAEditar(null)} className="flex-1 py-2.5 border border-outline text-secondary font-label-caps text-xs uppercase hover:bg-surface-container-low transition-colors bg-transparent">
                            Cancelar
                          </button>
                          <button type="submit" className="flex-1 py-2.5 bg-primary text-white font-label-caps text-xs uppercase hover:bg-primary/90 transition-colors border-0">
                            Guardar
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TABS: Órdenes */}
            {tabActiva === 'orders' && (
              <div className="space-y-6 animate-fade-in">
                <div className="overflow-x-auto bg-surface-container-lowest border border-outline-variant/20 rounded shadow-sm">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/10 bg-surface-container-low text-[10px] font-label-caps uppercase text-outline font-semibold">
                        <th className="p-4">Orden</th>
                        <th className="p-4">Cliente</th>
                        <th className="p-4">Fecha</th>
                        <th className="p-4">Productos Detalle</th>
                        <th className="p-4 text-right">Total</th>
                        <th className="p-4 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 font-body-md">
                      {ordenes.map((o) => (
                        <tr key={o.idOrden} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className="p-4 font-semibold text-primary">#{o.idOrden}</td>
                          <td className="p-4">
                            <div className="font-semibold text-on-surface">{o.usuario}</div>
                            {o.metodoPago && (
                              <div className="text-xs text-primary capitalize font-medium mt-1">
                                Pago: {o.metodoPago}
                              </div>
                            )}
                            {o.direccion && (
                              <div className="text-[10px] text-outline line-clamp-1 max-w-[200px] mt-0.5" title={`${o.nombreCompleto} - ${o.direccion}, ${o.ciudad}`}>
                                Envío: {o.direccion}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-secondary text-xs">
                            {new Date(o.fecha).toLocaleDateString('es-AR', {
                              day: '2-digit', month: '2-digit', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </td>
                          <td className="p-4 text-xs text-secondary">
                            <ul className="list-disc pl-4 space-y-1">
                              {o.detalles?.map((det) => (
                                <li key={det.idDetalle}>
                                  {det.nombreProducto} ({det.cantidad}u)
                                </li>
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

            {/* TABS: Categorías */}
            {tabActiva === 'categories' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
                
                {/* Formulario Agregar */}
                <div className="md:col-span-1 bg-surface-container-lowest border border-outline-variant/20 p-6 rounded shadow-sm space-y-4">
                  <h3 className="font-label-caps text-xs tracking-wider uppercase text-on-surface font-semibold">Agregar Categoría</h3>
                  <form onSubmit={handleCrearCategoria} className="space-y-4 text-sm font-body-md">
                    <div>
                      <label className="block text-xs uppercase font-label-caps text-outline mb-1">Nombre</label>
                      <input
                        type="text"
                        placeholder="Ej: Dijes, Cadenas..."
                        value={nuevaCatNombre}
                        onChange={(e) => setNuevaCatNombre(e.target.value)}
                        className="w-full bg-transparent border border-outline/35 rounded p-3 text-on-surface focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                    <button type="submit" className="w-full py-3 bg-on-surface text-background hover:bg-primary hover:text-white transition-all uppercase tracking-widest font-label-caps text-[10px] border-0 cursor-pointer">
                      Agregar Categoría
                    </button>
                  </form>
                </div>

                {/* Listado Categorías */}
                <div className="md:col-span-2 bg-surface-container-lowest border border-outline-variant/20 rounded shadow-sm overflow-hidden">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/10 bg-surface-container-low text-[10px] font-label-caps uppercase text-outline font-semibold">
                        <th className="p-4">ID</th>
                        <th className="p-4">Nombre de Categoría</th>
                        <th className="p-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 font-body-md">
                      {categorias.map((c) => {
                        const esModoEdicion = catAEditar && catAEditar.idCategoria === c.idCategoria;
                        return (
                          <tr key={c.idCategoria} className="hover:bg-surface-container-low/30 transition-colors">
                            <td className="p-4 text-secondary text-xs">#{c.idCategoria}</td>
                            <td className="p-4 font-semibold text-on-surface">
                              {esModoEdicion ? (
                                <input
                                  type="text"
                                  value={editCatNombre}
                                  onChange={(e) => setEditCatNombre(e.target.value)}
                                  className="bg-transparent border-0 border-b border-primary py-1 px-0 focus:ring-0 focus:border-primary text-on-surface text-sm font-semibold w-full max-w-xs"
                                  required
                                />
                              ) : (
                                c.nombre
                              )}
                            </td>
                            <td className="p-4 text-right space-x-3">
                              {esModoEdicion ? (
                                <>
                                  <button
                                    onClick={() => handleGuardarCategoria(c.idCategoria)}
                                    className="text-primary hover:underline text-xs uppercase tracking-wider font-semibold bg-transparent border-0 cursor-pointer"
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    onClick={() => setCatAEditar(null)}
                                    className="text-secondary hover:underline text-xs uppercase tracking-wider font-semibold bg-transparent border-0 cursor-pointer"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setCatAEditar(c);
                                      setEditCatNombre(c.nombre);
                                    }}
                                    className="text-primary hover:underline text-xs uppercase tracking-wider font-semibold bg-transparent border-0 cursor-pointer"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleEliminarCategoria(c.idCategoria)}
                                    className="text-error hover:underline text-xs uppercase tracking-wider font-semibold bg-transparent border-0 cursor-pointer"
                                  >
                                    Eliminar
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
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

export default PanelAdmin;
