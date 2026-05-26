import { useState, useEffect, useCallback } from 'react';
import {
  getProductos,
  getCategorias,
  crearProducto,
  editarProducto,
  eliminarProducto,
  aplicarDescuento,
} from '../services/api';

const formatearPrecio = (precio) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(precio);

const FORM_VACIO = {
  nombre: '',
  descripcion: '',
  precio: '',
  descuento: 0,
  stock: '',
  imagenUrl: '',
  categoriaId: '',
};

function PanelVendedor({ auth }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState(FORM_VACIO);
  const [modoEdicion, setModoEdicion] = useState(null);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Modal de descuento
  const [modalDescuento, setModalDescuento] = useState(null);
  const [valorDescuento, setValorDescuento] = useState('');

  // Carga categorías al montar
  useEffect(() => {
    getCategorias().then(setCategorias).catch(() => {});
  }, []);

  // Carga los productos creados por este usuario
  const cargarProductos = useCallback(async () => {
    setCargando(true);
    try {
      const todos = await getProductos();
      const creadosPorMi = todos ? todos.filter(p => Number(p.idVendedor) === Number(auth.idUsuario)) : [];
      setProductos(creadosPorMi);
    } catch {
      setProductos([]);
    } finally {
      setCargando(false);
    }
  }, [auth.idUsuario]);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const mostrarExito = (msg) => {
    setExito(msg);
    setTimeout(() => setExito(''), 3500);
  };

  const mostrarError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 4500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.precio || !form.stock || !form.categoriaId) {
      mostrarError('Nombre, precio, stock y categoría son obligatorios.');
      return;
    }
    setEnviando(true);
    setError('');
    const datos = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: parseFloat(form.precio),
      descuento: parseFloat(form.descuento) || 0,
      stock: parseInt(form.stock),
      imagenUrl: form.imagenUrl || null,
      categoriaId: parseInt(form.categoriaId),
    };
    try {
      if (modoEdicion) {
        await editarProducto(modoEdicion, auth.idUsuario, datos);
        mostrarExito('Producto actualizado correctamente.');
      } else {
        await crearProducto(auth.idUsuario, datos);
        mostrarExito('Producto creado correctamente.');
      }
      setForm(FORM_VACIO);
      setModoEdicion(null);
      await cargarProductos();
    } catch (err) {
      mostrarError(err.message || 'Error al guardar el producto.');
    } finally {
      setEnviando(false);
    }
  };

  const handleEditar = (producto) => {
    setForm({
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      precio: producto.precio?.toString() || '',
      descuento: producto.descuento?.toString() || '0',
      stock: producto.stock?.toString() || '',
      imagenUrl: producto.imagenUrl || '',
      categoriaId: '', // No viene el id directo de categoría, se debe seleccionar nuevamente
    });
    setModoEdicion(producto.idProducto);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelarEdicion = () => {
    setForm(FORM_VACIO);
    setModoEdicion(null);
    setError('');
  };

  const handleEliminar = async (producto) => {
    if (!confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await eliminarProducto(producto.idProducto, auth.idUsuario);
      mostrarExito('Producto eliminado.');
      await cargarProductos();
    } catch (err) {
      mostrarError(err.message || 'Error al eliminar el producto.');
    }
  };

  const handleAbrirDescuento = (producto) => {
    setModalDescuento({ idProducto: producto.idProducto, nombre: producto.nombre });
    setValorDescuento(producto.descuento?.toString() || '0');
  };

  const handleAplicarDescuento = async () => {
    const descuento = parseFloat(valorDescuento);
    if (isNaN(descuento) || descuento < 0 || descuento > 100) {
      mostrarError('El descuento debe ser un número entre 0 y 100.');
      return;
    }
    try {
      await aplicarDescuento(modalDescuento.idProducto, auth.idUsuario, descuento);
      setModalDescuento(null);
      mostrarExito(`Descuento de ${descuento}% aplicado.`);
      await cargarProductos();
    } catch (err) {
      mostrarError(err.message || 'Error al aplicar el descuento.');
    }
  };

  return (
    <main className="pt-32 pb-section-gap min-h-screen bg-background text-on-surface">
      <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
        
        {/* Encabezado */}
        <div className="border-b border-outline-variant/10 pb-6 mb-12">
          <h1 className="font-display-lg text-4xl md:text-5xl text-on-surface mb-2">Panel del Vendedor</h1>
          <p className="font-body-md text-sm text-secondary">
            Administración del inventario de joyería fina y control de catálogo.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Columna Izquierda: Formulario de producto */}
          <div className="lg:col-span-1 bg-surface-container-low p-6 md:p-8 border border-outline-variant/10 rounded-xl space-y-6">
            <h2 className="font-label-caps text-label-caps text-on-surface tracking-widest uppercase border-b border-outline-variant/10 pb-4 mb-2">
              {modoEdicion ? 'Editar Pieza' : 'Nueva Creación'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre */}
              <div className="flex flex-col">
                <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="nombre">
                  Nombre de la joya *
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  placeholder="Ej: Anillo Solitario"
                  className="w-full bg-transparent border-0 border-b border-outline/30 py-2 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/20 font-body-md text-on-surface"
                  value={form.nombre}
                  onChange={handleChange}
                />
              </div>

              {/* Descripción */}
              <div className="flex flex-col">
                <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="descripcion">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  placeholder="Materiales, pureza, detalles artesanales..."
                  className="w-full bg-transparent border border-outline/20 rounded-md py-2 px-3 focus:ring-0 focus:border-primary placeholder:text-outline/20 font-body-md text-on-surface h-24 resize-none"
                  value={form.descripcion}
                  onChange={handleChange}
                />
              </div>

              {/* Grid 3 Columnas: Precio, Descuento, Stock */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="precio">
                    Precio *
                  </label>
                  <input
                    id="precio"
                    name="precio"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="USD"
                    className="w-full bg-transparent border-0 border-b border-outline/30 py-2 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/20 font-body-md text-on-surface"
                    value={form.precio}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="descuento">
                    Desc (%)
                  </label>
                  <input
                    id="descuento"
                    name="descuento"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    className="w-full bg-transparent border-0 border-b border-outline/30 py-2 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/20 font-body-md text-on-surface"
                    value={form.descuento}
                    onChange={handleChange}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="stock">
                    Stock *
                  </label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    required
                    placeholder="Cant."
                    className="w-full bg-transparent border-0 border-b border-outline/30 py-2 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/20 font-body-md text-on-surface"
                    value={form.stock}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Categoría y URL de Imagen */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="categoriaId">
                    Categoría *
                  </label>
                  <select
                    id="categoriaId"
                    name="categoriaId"
                    required
                    className="w-full bg-transparent border-0 border-b border-outline/30 py-2 px-0 focus:ring-0 focus:border-primary font-body-md text-on-surface cursor-pointer"
                    value={form.categoriaId}
                    onChange={handleChange}
                  >
                    <option value="">Selecciona</option>
                    {categorias.map((cat) => (
                      <option key={cat.idCategoria} value={cat.idCategoria} className="bg-background text-on-surface">
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="imagenUrl">
                    URL de imagen
                  </label>
                  <input
                    id="imagenUrl"
                    name="imagenUrl"
                    type="url"
                    placeholder="https://..."
                    className="w-full bg-transparent border-0 border-b border-outline/30 py-2 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/20 font-body-md text-on-surface"
                    value={form.imagenUrl}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Botones del Formulario */}
              <div className="flex flex-col gap-3 pt-4">
                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full py-4 bg-on-surface text-background font-label-caps text-label-caps hover:bg-primary transition-all duration-300 disabled:opacity-50 disabled:hover:bg-on-surface uppercase tracking-widest"
                >
                  {enviando ? 'Guardando...' : modoEdicion ? 'Guardar Cambios' : 'Publicar Pieza'}
                </button>
                {modoEdicion && (
                  <button
                    type="button"
                    onClick={handleCancelarEdicion}
                    className="w-full py-3 border border-outline/30 hover:border-primary hover:text-primary transition-all duration-300 font-label-caps text-label-caps uppercase tracking-widest text-center"
                  >
                    Cancelar Edición
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Columna Derecha: Catálogo de productos */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-label-caps text-label-caps text-on-surface tracking-widest uppercase border-b border-outline-variant/10 pb-4">
              Colección Publicada
            </h2>

            {cargando ? (
              <div className="text-center py-20">
                <p className="font-label-caps text-label-caps text-primary tracking-widest animate-pulse">
                  Cargando catálogo...
                </p>
              </div>
            ) : productos.length === 0 ? (
              <div className="text-center py-20 bg-surface-container-low rounded-xl border border-dashed border-outline-variant/30">
                <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">
                  inventory_2
                </span>
                <p className="font-body-md text-secondary">
                  Aún no tienes productos publicados en el atelier.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-outline-variant/10 rounded-lg">
                <table className="min-w-full divide-y divide-outline-variant/10 bg-background text-left">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th scope="col" className="px-6 py-4 font-label-caps text-[10px] text-outline tracking-widest uppercase"></th>
                      <th scope="col" className="px-6 py-4 font-label-caps text-[10px] text-outline tracking-widest uppercase">Nombre</th>
                      <th scope="col" className="px-6 py-4 font-label-caps text-[10px] text-outline tracking-widest uppercase">Categoría</th>
                      <th scope="col" className="px-6 py-4 font-label-caps text-[10px] text-outline tracking-widest uppercase">Precio</th>
                      <th scope="col" className="px-6 py-4 font-label-caps text-[10px] text-outline tracking-widest uppercase">Descuento</th>
                      <th scope="col" className="px-6 py-4 font-label-caps text-[10px] text-outline tracking-widest uppercase text-center">Stock</th>
                      <th scope="col" className="px-6 py-4 font-label-caps text-[10px] text-outline tracking-widest uppercase text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {productos.map((producto) => (
                      <tr key={producto.idProducto} className="hover:bg-surface-container-low/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-12 h-16 bg-surface-container-low border border-outline-variant/10 flex items-center justify-center rounded select-none overflow-hidden">
                            {producto.imagenUrl ? (
                              <img
                                src={producto.imagenUrl}
                                alt={producto.nombre}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            ) : (
                              <span className="text-outline-variant text-lg">◇</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-body-md text-sm text-on-surface font-medium max-w-[180px] truncate">
                          {producto.nombre}
                        </td>
                        <td className="px-6 py-4 font-body-md text-sm text-secondary">
                          {producto.categoria || '—'}
                        </td>
                        <td className="px-6 py-4 font-body-md text-sm text-primary font-medium">
                          {formatearPrecio(producto.precio)}
                        </td>
                        <td className="px-6 py-4 font-body-md text-sm text-secondary">
                          {producto.descuento > 0 ? (
                            <span className="text-primary-container font-semibold">-{producto.descuento}%</span>
                          ) : '—'}
                        </td>
                        <td className="px-6 py-4 font-body-md text-sm text-on-surface text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            producto.stock <= 0 
                              ? 'bg-error-container text-on-error-container' 
                              : producto.stock <= 5 
                              ? 'bg-primary-fixed text-on-primary-fixed' 
                              : 'bg-transparent text-secondary'
                          }`}>
                            {producto.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-label-caps uppercase tracking-wider space-x-3">
                          <button
                            onClick={() => handleEditar(producto)}
                            className="text-primary hover:underline"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleAbrirDescuento(producto)}
                            className="text-primary-container hover:underline"
                          >
                            % Desc
                          </button>
                          <button
                            onClick={() => handleEliminar(producto)}
                            className="text-error hover:underline"
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
          </div>

        </div>
      </div>

      {/* Modal Descuento */}
      {modalDescuento && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-outline-variant/20 max-w-sm w-full p-8 rounded-xl shadow-2xl space-y-6">
            <div>
              <h3 className="font-display-lg text-2xl text-on-surface">Aplicar Descuento</h3>
              <p className="font-body-md text-secondary text-xs mt-1">
                Ajustar porcentaje promocional para: <span className="font-medium text-on-surface">{modalDescuento.nombre}</span>
              </p>
            </div>

            <div className="flex flex-col">
              <label htmlFor="modalDescuentoInput" className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-2">
                Porcentaje de descuento (0–100)
              </label>
              <input
                id="modalDescuentoInput"
                type="number"
                min="0"
                max="100"
                className="w-full bg-transparent border-0 border-b border-outline/30 py-2 px-0 focus:ring-0 focus:border-primary font-body-md text-on-surface"
                value={valorDescuento}
                onChange={(e) => setValorDescuento(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAplicarDescuento}
                className="flex-1 py-3 bg-on-surface text-background font-label-caps text-[11px] hover:bg-primary transition-all duration-300 uppercase tracking-widest"
              >
                Aplicar
              </button>
              <button
                onClick={() => setModalDescuento(null)}
                className="flex-1 py-3 border border-outline/30 hover:border-primary hover:text-primary transition-all duration-300 font-label-caps text-[11px] uppercase tracking-widest text-center"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts Flotantes */}
      {error && (
        <div className="fixed bottom-8 right-8 z-50 bg-error-container border border-error text-on-error-container px-6 py-4 rounded-lg shadow-2xl font-body-md text-sm animate-fade-in flex items-center gap-3">
          <span className="material-symbols-outlined text-lg">error</span>
          <span>{error}</span>
        </div>
      )}
      {exito && (
        <div className="fixed bottom-8 right-8 z-50 bg-on-surface text-background px-6 py-4 rounded-lg shadow-2xl font-label-caps text-[11px] tracking-widest uppercase border border-outline-variant/30 animate-fade-in flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-lg">done</span>
          <span>{exito}</span>
        </div>
      )}

    </main>
  );
}

export default PanelVendedor;
