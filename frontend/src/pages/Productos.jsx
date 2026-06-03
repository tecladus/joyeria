import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProductos, getCategorias, agregarAlCarrito } from '../services/api';
import TarjetaProducto from '../components/TarjetaProducto';
import { setCantidadCarrito } from '../redux/slices/carritoSlice';

const MATERIALES = [
  { id: '18K Yellow Gold', label: 'Oro Amarillo 18K' },
  { id: 'White Gold', label: 'Oro Blanco' },
  { id: 'Sterling Silver', label: 'Plata de Ley' },
  { id: 'Ethical Diamonds', label: 'Diamantes Éticos' }
];

function Productos() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const [todosLosProductos, setTodosLosProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Sincronización de categoría activa y búsqueda con Query Params de React Router
  const [searchParams, setSearchParams] = useSearchParams();
  const catQueryParam = searchParams.get('categoria');
  const searchQueryParam = searchParams.get('search');

  const [categoriaActiva, setCategoriaActiva] = useState(null);

  // Estados de filtros
  const [busqueda, setBusqueda] = useState(searchQueryParam || '');
  const [orden, setOrden] = useState('Newest'); // Newest, PriceLow, PriceHigh, Name
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [materialesSeleccionados, setMaterialesSeleccionados] = useState([]);
  
  // Paginación
  const [paginaActiva, setPaginaActiva] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Sincronizar query param con categoriaActiva
  useEffect(() => {
    if (catQueryParam) {
      setCategoriaActiva(parseInt(catQueryParam, 10));
    } else {
      setCategoriaActiva(null);
    }
  }, [catQueryParam]);

  // Sincronizar query param de búsqueda
  useEffect(() => {
    setBusqueda(searchQueryParam || '');
  }, [searchQueryParam]);

  // Carga todas las categorías al montar
  useEffect(() => {
    getCategorias()
      .then(setCategorias)
      .catch(() => {});
  }, []);

  // Carga TODOS los productos al montar para filtrar client-side
  useEffect(() => {
    const cargarTodosLosProductos = async () => {
      setCargando(true);
      setError('');
      try {
        const datos = await getProductos();
        setTodosLosProductos(datos || []);
      } catch (err) {
        setError(err.message || 'No se pudieron cargar los productos.');
      } finally {
        setCargando(false);
      }
    };
    cargarTodosLosProductos();
  }, []);

  // Resetear página activa cuando cambian los filtros
  useEffect(() => {
    setPaginaActiva(1);
  }, [categoriaActiva, busqueda, materialesSeleccionados, orden, precioMin, precioMax]);

  // Hacer scroll hacia arriba al cambiar de página o aplicar filtros principales
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [paginaActiva, categoriaActiva, orden, busqueda, materialesSeleccionados]);

  // Manejo de agregar al carrito
  const handleAgregarCarrito = async (productoId) => {
    if (!auth?.token || !auth?.idUsuario) return;
    try {
      const carritoActualizado = await agregarAlCarrito(auth.idUsuario, productoId, 1);
      const nuevoTotal = carritoActualizado?.items?.reduce((s, i) => s + i.cantidad, 0) || 0;
      dispatch(setCantidadCarrito(nuevoTotal));
      mostrarToast('Producto agregado al carrito con éxito');
    } catch (err) {
      mostrarToast(err.message || 'Error al agregar al carrito');
    }
  };

  const mostrarToast = (mensaje) => {
    setToast(mensaje);
    setTimeout(() => setToast(''), 2500);
  };

  const toggleMaterial = (materialId) => {
    setMaterialesSeleccionados((prev) =>
      prev.includes(materialId)
        ? prev.filter((m) => m !== materialId)
        : [...prev, materialId]
    );
  };

  // Cuenta productos por categoría
  const countPorCategoria = useCallback((catId) => {
    const disponibles = todosLosProductos.filter((p) => p.stock != null && p.stock > 0);
    if (catId === null) return disponibles.length;
    return disponibles.filter((p) => {
      const pCatId = p.idCategoria || (p.categoriaObj && p.categoriaObj.idCategoria);
      return pCatId === catId;
    }).length;
  }, [todosLosProductos]);

  // Procesamiento de productos: Filtro por búsqueda, categoría, material, rango de precios y ordenación
  const productosFiltradosYOrdenados = useMemo(() => {
    let resultado = todosLosProductos.filter((p) => p.stock != null && p.stock > 0);

    // Filtro por categoría (client-side)
    if (categoriaActiva !== null) {
      resultado = resultado.filter((p) => {
        const pCatId = p.idCategoria || (p.categoriaObj && p.categoriaObj.idCategoria);
        return pCatId === categoriaActiva;
      });
    }

    // Filtro por búsqueda de texto
    if (busqueda.trim() !== '') {
      const query = busqueda.toLowerCase();
      resultado = resultado.filter(
        (p) =>
          p.nombre.toLowerCase().includes(query) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(query))
      );
    }

    // Filtro por material
    if (materialesSeleccionados.length > 0) {
      resultado = resultado.filter((p) => {
        return materialesSeleccionados.some((mat) => {
          const name = p.nombre.toLowerCase();
          const desc = (p.descripcion || '').toLowerCase();
          if (mat === '18K Yellow Gold') {
            return (
              (name.includes('gold') || name.includes('oro') || desc.includes('gold') || desc.includes('oro')) &&
              !(name.includes('white') || name.includes('blanco') || desc.includes('white') || desc.includes('blanco'))
            );
          }
          if (mat === 'White Gold') {
            return (
              name.includes('white') || name.includes('blanco') || desc.includes('white') || desc.includes('blanco')
            );
          }
          if (mat === 'Sterling Silver') {
            return (
              name.includes('silver') || name.includes('plata') || desc.includes('silver') || desc.includes('plata')
            );
          }
          if (mat === 'Ethical Diamonds') {
            return (
              name.includes('diamond') ||
              name.includes('diamante') ||
              desc.includes('diamond') ||
              desc.includes('diamante') ||
              name.includes('solitaire') ||
              name.includes('brillante')
            );
          }
          return false;
        });
      });
    }

    // Filtro por precio mínimo
    if (precioMin !== '') {
      const min = parseFloat(precioMin);
      if (!isNaN(min)) {
        resultado = resultado.filter((p) => p.precio >= min);
      }
    }

    // Filtro por precio máximo
    if (precioMax !== '') {
      const max = parseFloat(precioMax);
      if (!isNaN(max)) {
        resultado = resultado.filter((p) => p.precio <= max);
      }
    }

    // Ordenamiento
    if (orden === 'PriceLow') {
      resultado.sort((a, b) => a.precio - b.precio);
    } else if (orden === 'PriceHigh') {
      resultado.sort((a, b) => b.precio - a.precio);
    } else if (orden === 'Name') {
      resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    return resultado;
  }, [todosLosProductos, categoriaActiva, busqueda, materialesSeleccionados, orden, precioMin, precioMax]);

  // Paginación real
  const totalPages = Math.ceil(productosFiltradosYOrdenados.length / ITEMS_PER_PAGE);
  const productosPaginados = useMemo(() => {
    const inicio = (paginaActiva - 1) * ITEMS_PER_PAGE;
    return productosFiltradosYOrdenados.slice(inicio, inicio + ITEMS_PER_PAGE);
  }, [productosFiltradosYOrdenados, paginaActiva]);

  return (
    <div className="min-h-screen pb-20 pt-32 bg-background text-on-surface">
      {/* Header de Colección */}
      <main className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
        <section className="mb-16">
          <h1 className="font-display-lg text-4xl md:text-6xl text-on-background mb-4">
            La Colección
          </h1>
          <p className="font-body-lg text-body-lg text-secondary max-w-2xl font-light">
            Una curaduría de piezas atemporales elaboradas con precisión ética. Cada artículo de la colección Aura es un testimonio de fuerza silenciosa y belleza duradera.
          </p>
        </section>

        {/* Catalog Grid Layout */}
        <div className="flex flex-col lg:flex-row gap-gutter">
          
          {/* Sidebar de Filtros */}
          <aside className="lg:w-1/4">
            <div className="sticky top-28 space-y-10 bg-transparent pr-6">
              
              {/* Categorías */}
              <div>
                <h3 className="font-label-caps text-label-caps text-on-surface mb-4 uppercase tracking-wider text-xs font-semibold">
                  Categoría
                </h3>
                <ul className="space-y-3">
                  <li>
                    <button
                      onClick={() => setCategoriaActiva(null)}
                      className={`font-body-md text-left w-full transition-colors flex items-center justify-between text-sm cursor-pointer bg-transparent border-0 p-0 ${
                        categoriaActiva === null ? 'text-primary font-medium' : 'text-secondary hover:text-primary'
                      }`}
                    >
                      <span>Todas las Piezas</span>
                      <span className="text-xs text-outline">{countPorCategoria(null)}</span>
                    </button>
                  </li>
                  {categorias.map((cat) => (
                    <li key={cat.idCategoria}>
                      <button
                        onClick={() => setCategoriaActiva(cat.idCategoria)}
                        className={`font-body-md text-left w-full transition-colors flex items-center justify-between text-sm cursor-pointer bg-transparent border-0 p-0 ${
                          categoriaActiva === cat.idCategoria ? 'text-primary font-medium' : 'text-secondary hover:text-primary'
                        }`}
                      >
                        <span>{cat.nombre}</span>
                        <span className="text-xs text-outline">{countPorCategoria(cat.idCategoria)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rango de Precios */}
              <div className="border-t border-outline-variant/20 pt-8">
                <h3 className="font-label-caps text-label-caps text-on-surface mb-4 uppercase tracking-wider text-xs font-semibold">
                  Rango de Precios
                </h3>
                <div className="flex items-center space-x-3">
                  <div className="relative flex-grow">
                    <span className="absolute left-3 top-2 text-xs text-outline font-body-md">$</span>
                    <input
                      type="number"
                      min="0"
                      value={precioMin}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || parseFloat(val) >= 0) {
                          setPrecioMin(val);
                        }
                      }}
                      placeholder="Min"
                      className="w-full bg-transparent border border-outline-variant/65 rounded-sm py-2 pl-7 pr-3 font-body-md text-sm focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-outline/40 text-on-surface"
                    />
                  </div>
                  <span className="text-outline-variant">—</span>
                  <div className="relative flex-grow">
                    <span className="absolute left-3 top-2 text-xs text-outline font-body-md">$</span>
                    <input
                      type="number"
                      min="0"
                      value={precioMax}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || parseFloat(val) >= 0) {
                          setPrecioMax(val);
                        }
                      }}
                      placeholder="Max"
                      className="w-full bg-transparent border border-outline-variant/65 rounded-sm py-2 pl-7 pr-3 font-body-md text-sm focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-outline/40 text-on-surface"
                    />
                  </div>
                </div>
                {(precioMin !== '' || precioMax !== '' || materialesSeleccionados.length > 0 || busqueda !== '') && (
                  <button
                    onClick={() => {
                      setPrecioMin('');
                      setPrecioMax('');
                      setMaterialesSeleccionados([]);
                      setBusqueda('');
                    }}
                    className="text-[10px] font-label-caps text-error tracking-wider uppercase mt-4 hover:underline block cursor-pointer bg-transparent border-0"
                  >
                    Limpiar Filtros
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Grid de Productos */}
          <div className="lg:w-3/4">
            {/* Cabecera del Listado */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-10 pb-4 border-b border-outline-variant/10 gap-4">
              <span className="font-label-caps text-label-caps text-secondary text-xs">
                Mostrando {productosFiltradosYOrdenados.length === 0 ? 0 : (paginaActiva - 1) * ITEMS_PER_PAGE + 1} - {Math.min(paginaActiva * ITEMS_PER_PAGE, productosFiltradosYOrdenados.length)} de {productosFiltradosYOrdenados.length} piezas
              </span>
              <div className="flex items-center space-x-2">
                <span className="font-label-caps text-label-caps text-secondary text-xs">Ordenar por:</span>
                <select
                  value={orden}
                  onChange={(e) => setOrden(e.target.value)}
                  className="bg-transparent border-none font-label-caps text-label-caps text-on-surface focus:ring-0 cursor-pointer py-1 pr-8 text-xs font-semibold"
                >
                  <option value="Newest">Novedades</option>
                  <option value="PriceLow">Precio: Menor a Mayor</option>
                  <option value="PriceHigh">Precio: Mayor a Menor</option>
                  <option value="Name">Nombre: A - Z</option>
                </select>
              </div>
            </div>

            {/* Mensajes de carga o error */}
            {cargando && (
              <div className="text-center py-20">
                <p className="font-label-caps text-label-caps text-primary tracking-widest animate-pulse">
                  Cargando Colección...
                </p>
              </div>
            )}
            {error && (
              <div className="bg-error-container border border-error text-on-error-container p-4 rounded-xl mb-8 font-body-md text-sm">
                {error}
              </div>
            )}

            {/* Listado Principal */}
            {!cargando && !error && (
              <>
                {productosFiltradosYOrdenados.length === 0 ? (
                  <div className="text-center py-20 bg-surface-container-low rounded border border-dashed border-outline-variant/30 animate-fade-in">
                    <span className="material-symbols-outlined text-4xl text-outline-variant mb-3 block">
                      inbox
                    </span>
                    <p className="font-body-md text-secondary text-sm">
                      No se encontraron piezas que coincidan con los filtros.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-y-12 gap-x-4 sm:gap-x-gutter animate-fade-in">
                    {productosPaginados.map((producto) => (
                      <TarjetaProducto
                        key={producto.idProducto}
                        producto={producto}
                        onAgregarCarrito={handleAgregarCarrito}
                      />
                    ))}
                  </div>
                )}

                {/* Paginación Real */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-6 mt-20 pt-10 border-t border-outline-variant/10 text-xs font-label-caps animate-fade-in">
                    <button 
                      onClick={() => setPaginaActiva((p) => Math.max(p - 1, 1))}
                      disabled={paginaActiva === 1}
                      className="text-secondary hover:text-primary transition-colors cursor-pointer flex items-center gap-1 font-semibold uppercase tracking-wider disabled:opacity-30 disabled:cursor-default bg-transparent border-0"
                    >
                      &larr; Anterior
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      page === paginaActiva ? (
                        <span 
                          key={page} 
                          className="text-primary border-b border-primary pb-0.5 font-semibold cursor-pointer"
                        >
                          {page.toString().padStart(2, '0')}
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setPaginaActiva(page)}
                          className="text-secondary hover:text-primary transition-colors cursor-pointer bg-transparent border-0 font-label-caps text-xs"
                        >
                          {page.toString().padStart(2, '0')}
                        </button>
                      )
                    ))}

                    <button 
                      onClick={() => setPaginaActiva((p) => Math.min(p + 1, totalPages))}
                      disabled={paginaActiva === totalPages}
                      className="text-secondary hover:text-primary transition-colors cursor-pointer flex items-center gap-1 font-semibold uppercase tracking-wider disabled:opacity-30 disabled:cursor-default bg-transparent border-0"
                    >
                      Siguiente &rarr;
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Toast flotante de confirmación */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 bg-on-surface text-background px-6 py-4 rounded shadow-2xl font-label-caps text-[11px] tracking-widest uppercase border border-outline-variant/30 animate-fade-in flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-sm">done</span>
          {toast}
        </div>
      )}
    </div>
  );
}

export default Productos;
