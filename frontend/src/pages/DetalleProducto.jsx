import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import TarjetaProducto from '../components/TarjetaProducto';
import { adjustPriceByDevice, useDeviceMultiplier } from '../services/deviceDetection';
import { agregarProductoAlCarrito } from '../redux/slices/carritoSlice';
import { toggleFavorito, selectFavoritos } from '../redux/slices/favoritosSlice';
import { fetchProductoPorId, fetchProductos, limpiarItemSeleccionado } from '../redux/slices/productosSlice';
import { obtenerBadgeEscasez, obtenerSelloPromo } from '../services/urgencia';

const formatearPrecio = (precio) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(precio);

const precioConDescuento = (precio, descuento) => {
  if (!descuento || descuento <= 0) return null;
  return precio * (1 - descuento / 100);
};

const CATEGORY_TRANSLATIONS = {
  'Anillos': 'Rings',
  'Collares': 'Necklaces',
  'Pulseras': 'Bracelets',
  'Aros': 'Earrings'
};

function DetalleProducto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const favoritos = useSelector(selectFavoritos);
  const deviceMultiplier = useDeviceMultiplier();

  const { itemSeleccionado: producto, cargando, error: errorProducto, items: todosLosProductos } = useSelector((state) => state.productos);
  const esFavorito = producto && favoritos.some((item) => item.idProducto === producto.idProducto);
  const [error, setError] = useState('');
  const [agregando, setAgregando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  const [tallaSeleccionada, setTallaSeleccionada] = useState(null);
  const [imagenActiva, setImagenActiva] = useState('');
  const [mostrarGuiaTallas, setMostrarGuiaTallas] = useState(false);

  // Auto-dismiss local errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const recomendados = useMemo(() => {
    return (todosLosProductos || [])
      .filter((p) => p.idProducto !== parseInt(id, 10))
      .slice(0, 4);
  }, [todosLosProductos, id]);

  // Carga el producto por ID
  useEffect(() => {
    dispatch(fetchProductoPorId(id));
    setTallaSeleccionada(null);
    return () => {
      dispatch(limpiarItemSeleccionado());
    };
  }, [id, dispatch]);

  // Carga recomendados/productos
  useEffect(() => {
    dispatch(fetchProductos());
  }, [dispatch]);

  // Sincronizar imagenActiva
  useEffect(() => {
    if (producto && producto.imagenUrl) {
      setImagenActiva(producto.imagenUrl);
    }
  }, [producto]);

  const handleAgregarCarrito = async (productoIdInput) => {
    if (!auth?.token || !auth?.idUsuario) {
      navigate('/login');
      return;
    }

    const esRecomendado = typeof productoIdInput === 'number' || typeof productoIdInput === 'string';
    const targetProductoId = esRecomendado ? productoIdInput : producto?.idProducto;

    if (!esRecomendado) {
      // Si es anillo principal, requerimos seleccionar talla
      const catNombre = (producto?.categoria || '').trim().toLowerCase();
      const esAnilloPrincipal = catNombre === 'anillos' || catNombre === 'rings';
      if (esAnilloPrincipal && !tallaSeleccionada) {
        setError('Por favor, selecciona una talla antes de añadir a la bolsa.');
        return;
      }
    }

    setAgregando(true);
    setError('');
    try {
      await dispatch(agregarProductoAlCarrito({ idUsuario: auth.idUsuario, productoId: targetProductoId, cantidad: 1 })).unwrap();
      setMensajeExito('Producto agregado al carrito con éxito');
      setTimeout(() => setMensajeExito(''), 3000);
    } catch (err) {
      setError(err.message || err || 'Error al agregar al carrito.');
    } finally {
      setAgregando(false);
    }
  };

  const sinStock = producto && (!producto.stock || producto.stock <= 0);
  const selloPromo = producto ? obtenerSelloPromo(producto) : null;
  const badgeEscasez = producto ? obtenerBadgeEscasez(producto) : null;
  const precioConDesc = producto ? precioConDescuento(producto.precio, producto.descuento) : null;
  const precioBase = precioConDesc ?? producto?.precio;
  const precioFinal = producto ? adjustPriceByDevice(precioBase) : null;
  const precioOriginalAjustado = producto ? adjustPriceByDevice(producto.precio) : null;
  const categoriaIngles = producto?.categoria ? (CATEGORY_TRANSLATIONS[producto.categoria] || producto.categoria) : '';
  const catNombre = (producto?.categoria || '').trim().toLowerCase();
  const esAnillo = catNombre === 'anillos' || catNombre === 'rings';

  const imagenesSecundarias = producto ? [producto.imagenUrl].filter(Boolean) : [];

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-label-caps text-label-caps text-primary tracking-widest animate-pulse text-xs">
          Cargando detalles del atelier...
        </p>
      </div>
    );
  }

  return (
    <main className="pt-32 pb-20 bg-background text-on-surface">
      <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
        
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 font-label-caps text-[10px] text-outline uppercase tracking-wider mb-8">
          <Link to="/productos" className="hover:text-primary transition-colors">Colecciones</Link>
          <span className="text-outline-variant">/</span>
          {producto?.categoria && (
            <>
              <span className="text-secondary">{producto.categoria}</span>
              <span className="text-outline-variant">/</span>
            </>
          )}
          <span className="text-on-surface font-semibold truncate max-w-[200px]">{producto?.nombre}</span>
        </nav>

        {(error || errorProducto) && (
          <div className="bg-error-container border border-error text-on-error-container p-4 rounded mb-8 font-body-md text-sm flex justify-between items-center animate-fade-in">
            <span>{error || errorProducto}</span>
            <button onClick={() => { setError(''); }} className="bg-transparent border-0 text-error cursor-pointer flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {producto && (
          <div>
            {/* Split Product Details Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
              
              {/* Columna Izquierda: Imagen y Galería de Miniaturas */}
              <div className="lg:col-span-7 space-y-4">
                <div className="relative overflow-hidden aspect-[4/5] bg-surface-container-low border border-outline-variant/10 group rounded-sm shadow-sm">
                  {imagenActiva ? (
                    <img
                      src={imagenActiva}
                      alt={producto.nombre}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-4xl text-outline-variant/30">
                      ◇
                    </div>
                  )}
                  {producto.descuento > 0 && (
                    <span className="absolute top-4 left-4 px-3 py-1 font-label-caps text-[9px] border border-primary text-primary backdrop-blur-md bg-surface-container-lowest/20 uppercase tracking-widest">
                      -{producto.descuento}% DTO
                    </span>
                  )}
                </div>

                {/* Thumbnails Row */}
                {imagenesSecundarias.length > 1 && (
                  <div className="grid grid-cols-4 gap-4">
                    {imagenesSecundarias.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setImagenActiva(img)}
                        className={`aspect-square overflow-hidden border bg-surface-container-low rounded-sm cursor-pointer transition-all duration-300 ${
                          imagenActiva === img 
                            ? 'border-primary outline outline-1 outline-primary/45 shadow-sm' 
                            : 'border-outline-variant/20 hover:border-outline/50'
                        }`}
                      >
                        <img src={img} alt={`Ángulo ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Columna Derecha: Información del Producto, Tallas, Compra */}
              <div className="lg:col-span-5 space-y-8">
                <div>
                  {(badgeEscasez || selloPromo) && (
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {badgeEscasez && (
                        <div className={`inline-flex items-center gap-2 px-4 py-2 border font-label-caps text-[11px] tracking-wider uppercase ${badgeEscasez.clases}`}>
                          <span className="material-symbols-outlined text-base leading-none">{badgeEscasez.icono}</span>
                          <span className="leading-none">{badgeEscasez.texto}</span>
                        </div>
                      )}
                      {selloPromo && (
                        <div className={`inline-flex items-center gap-2 px-4 py-2 border font-label-caps text-[11px] tracking-wider uppercase ${selloPromo.clases}`}>
                          <span className="material-symbols-outlined text-base leading-none">{selloPromo.icono}</span>
                          <span className="leading-none">{selloPromo.texto}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {producto.categoria && (
                    <span className="font-label-caps text-label-caps text-primary mb-2 block tracking-widest uppercase text-xs">
                      {producto.categoria}
                    </span>
                  )}
                  <h1 className="font-display-lg text-4xl md:text-5xl text-on-surface leading-tight font-light mb-4">
                    {producto.nombre}
                  </h1>
                  
                  {/* Precios */}
                  <div className="flex items-baseline gap-4 mt-6">
                    <span className="font-display-lg text-2xl md:text-3xl text-primary font-light">
                      {formatearPrecio(precioFinal)}
                    </span>
                    {precioConDesc && (
                      <span className="font-body-md text-lg text-secondary line-through">
                        {formatearPrecio(precioOriginalAjustado)}
                      </span>
                    )}
                  </div>
                </div>

                {/* El Diseño Description */}
                <div className="border-t border-outline-variant/10 pt-6">
                  <h4 className="font-label-caps text-[10px] tracking-widest text-outline uppercase block mb-3 font-semibold">
                    El Diseño
                  </h4>
                  <p className="font-body-lg text-secondary text-sm leading-relaxed font-light">
                    {producto.descripcion || 'Inspirado en el concepto de carácter moral y verdad eterna. Esta pieza magistralmente elaborada representa un estándar de fuerza silenciosa, diseñada para lucirse como una declaración de estilo y transmitirse de generación en generación.'}
                  </p>
                </div>

                {/* Selector de Tallas (solo para Anillos) */}
                {esAnillo && (
                  <div className="border-t border-outline-variant/10 pt-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-label-caps text-[10px] tracking-widest text-outline uppercase font-semibold">Seleccionar Talla</span>
                      <button 
                        onClick={() => setMostrarGuiaTallas(true)}
                        className="font-label-caps text-[9px] text-outline/80 hover:text-primary uppercase tracking-wider cursor-pointer underline bg-transparent border-0"
                      >
                        Guía de Tallas
                      </button>
                    </div>
                    <div className="flex gap-3">
                      {[5, 6, 7, 8, 9].map((talla) => (
                        <button
                          key={talla}
                          onClick={() => setTallaSeleccionada(talla)}
                          className={`w-10 h-10 border text-xs font-body-md transition-all flex items-center justify-center rounded-sm cursor-pointer ${
                            tallaSeleccionada === talla
                              ? 'border-on-surface bg-on-surface text-background font-semibold'
                              : 'border-outline-variant/40 hover:border-primary text-secondary'
                          }`}
                        >
                          {talla}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadatos (Stock, Vendedor) */}
                <div className="border-t border-outline-variant/10 pt-6 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-label-caps text-[9px] text-outline uppercase tracking-widest">Disponibilidad</span>
                    <span className={`font-body-md font-semibold ${producto.stock <= 0 ? 'text-error' : 'text-on-surface'}`}>
                      {producto.stock <= 0 ? 'Agotado' : `${producto.stock} piezas disponibles`}
                    </span>
                  </div>
                  {producto.vendedor && (
                    <div className="flex justify-between items-center">
                      <span className="font-label-caps text-[9px] text-outline uppercase tracking-widest">Artesano del Atelier</span>
                      <span className="font-body-md text-secondary font-light">{producto.vendedor}</span>
                    </div>
                  )}
                </div>

                {/* Acciones de Botones */}
                <div className="border-t border-outline-variant/10 pt-6 space-y-4">
                  {mensajeExito && (
                    <div className="bg-surface-container border border-outline-variant text-on-surface p-4 rounded flex items-center gap-2 font-label-caps text-[10px] tracking-widest uppercase">
                      <span className="material-symbols-outlined text-primary text-sm">done</span>
                      {mensajeExito}
                    </div>
                  )}

                    <div className="flex gap-4">
                      {/* Add to Bag Button */}
                      <button
                        disabled={sinStock || agregando}
                        onClick={handleAgregarCarrito}
                        className="flex-grow py-5 bg-on-surface text-background font-label-caps text-label-caps hover:bg-primary transition-all duration-500 disabled:opacity-50 disabled:hover:bg-on-surface disabled:cursor-not-allowed uppercase tracking-widest text-xs font-semibold cursor-pointer rounded-sm"
                      >
                        {agregando ? 'Añadiendo...' : sinStock ? 'Agotado' : 'Añadir a la Bolsa'}
                      </button>

                      {/* Favorite Button */}
                      {producto && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!auth?.token) {
                              navigate('/login');
                              return;
                            }
                            dispatch(toggleFavorito(producto));
                          }}
                          className="px-6 border border-outline-variant/35 hover:border-primary transition-all duration-300 flex items-center justify-center cursor-pointer rounded-sm text-on-surface hover:text-error bg-transparent"
                          title={esFavorito ? 'Quitar de Favoritos' : 'Añadir a Favoritos'}
                        >
                          <span 
                            className="material-symbols-outlined text-2xl"
                            style={esFavorito ? { fontVariationSettings: '"FILL" 1', color: '#e53e3e' } : {}}
                          >
                            favorite
                          </span>
                        </button>
                      )}
                    </div>
                </div>

                {/* Envíos y Soporte microinfo */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-xs text-secondary font-body-md font-light">
                    <span className="material-symbols-outlined text-outline text-lg">local_shipping</span>
                    <span>Envío asegurado de cortesía en un plazo de 48 horas.</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-secondary font-body-md font-light">
                    <span className="material-symbols-outlined text-outline text-lg">verified</span>
                    <span>Garantía de por vida y servicio de limpieza.</span>
                  </div>
                </div>
              </div>
              
            </div>

            {/* Middle Section: The Atelier Process */}
            <section className="mt-32 pt-20 border-t border-outline-variant/20 text-center">
              <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase block mb-3 text-xs">
                El Proceso del Atelier
              </span>
              <h2 className="font-display-lg text-3xl md:text-4xl text-on-surface mb-4 font-light">
                Meticulosamente Elaborado para la Durabilidad
              </h2>
              <p className="font-body-md text-secondary text-sm max-w-xl mx-auto mb-16 font-light">
                Cada pieza en Aura se somete a un riguroso proceso de inspección de 14 puntos. Desde la selección de minerales en bruto hasta el pulido final a mano, la precisión es nuestro único estándar.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 bg-surface-container flex items-center justify-center rounded-full text-primary border border-outline-variant/10">
                    <span className="material-symbols-outlined text-xl">workspace_premium</span>
                  </div>
                  <h3 className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest text-xs font-semibold">
                    Libre de Conflictos
                  </h3>
                  <p className="font-body-md text-secondary text-xs leading-relaxed max-w-xs font-light">
                    Todos los diamantes provienen de proveedores que se adhieren al Proceso de Kimberley, garantizando absoluta tranquilidad.
                  </p>
                </div>
                
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 bg-surface-container flex items-center justify-center rounded-full text-primary border border-outline-variant/10">
                    <span className="material-symbols-outlined text-xl">architecture</span>
                  </div>
                  <h3 className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest text-xs font-semibold">
                    Diseño Original
                  </h3>
                  <p className="font-body-md text-secondary text-xs leading-relaxed max-w-xs font-light">
                    Bocetado a mano en nuestro estudio de Amberes, cada montura es una hazaña arquitectónica única de equilibrio y luz.
                  </p>
                </div>

                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 bg-surface-container flex items-center justify-center rounded-full text-primary border border-outline-variant/10">
                    <span className="material-symbols-outlined text-xl">blur_on</span>
                  </div>
                  <h3 className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest text-xs font-semibold">
                    Pulido de Firma
                  </h3>
                  <p className="font-body-md text-secondary text-xs leading-relaxed max-w-xs font-light">
                    Nuestra técnica patentada de acabado espejado garantiza que su joyería mantenga su brillo y esplendor durante décadas.
                  </p>
                </div>
              </div>
            </section>

            {/* Bottom Section: Recomendaciones */}
            {recomendados.length > 0 && (
              <section className="mt-32 pt-20 border-t border-outline-variant/20">
                <div className="flex justify-between items-center mb-12">
                  <div>
                    <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase block mb-2 text-xs">
                      Completar el Juego
                    </span>
                    <h2 className="font-display-lg text-2xl md:text-3xl text-on-surface font-light">
                      También te Podría Gustar
                    </h2>
                  </div>
                  <Link to="/productos" className="font-label-caps text-label-caps text-outline hover:text-primary uppercase tracking-wider text-xs underline">
                    Ver Todo
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
                  {recomendados.map((prod) => (
                    <TarjetaProducto
                      key={prod.idProducto}
                      producto={prod}
                      onAgregarCarrito={handleAgregarCarrito}
                    />
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>

      {/* Modal de Guía de Tallas */}
      {mostrarGuiaTallas && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-outline-variant/20 max-w-md w-full p-8 rounded-xl luxury-shadow space-y-6 animate-scale-up">
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
              <h2 className="font-display-lg text-2xl text-on-surface font-light">
                Guía de Tallas de Anillos
              </h2>
              <button 
                onClick={() => setMostrarGuiaTallas(false)}
                className="material-symbols-outlined text-secondary hover:text-primary bg-transparent border-0 cursor-pointer text-xl"
              >
                close
              </button>
            </div>

            <p className="font-body-md text-secondary leading-relaxed text-xs font-light">
              Para encontrar su ajuste perfecto, mida el diámetro interno de un anillo que le quede cómodo y compárelo con la siguiente tabla de equivalencias:
            </p>

            {/* Tabla de tallas */}
            <div className="border border-outline-variant/15 rounded overflow-hidden">
              <table className="w-full text-left text-xs font-body-md">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant/15 font-label-caps text-[10px] tracking-wider text-on-surface">
                    <th className="p-3 font-semibold uppercase">Talla US</th>
                    <th className="p-3 font-semibold uppercase">Diámetro Interno (mm)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-secondary">
                  <tr>
                    <td className="p-3 font-semibold text-on-surface">5</td>
                    <td className="p-3">15.7 mm</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-on-surface">6</td>
                    <td className="p-3">16.5 mm</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-on-surface">7</td>
                    <td className="p-3">17.3 mm</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-on-surface">8</td>
                    <td className="p-3">18.2 mm</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-on-surface">9</td>
                    <td className="p-3">19.0 mm</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="font-body-md text-primary leading-relaxed text-[11px] font-light italic">
              ◇ Nota: Si se encuentra entre dos tallas, le recomendamos seleccionar la talla superior para asegurar la máxima comodidad de su pieza.
            </p>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setMostrarGuiaTallas(false)}
                className="w-full py-4 bg-on-surface text-background font-label-caps text-label-caps hover:bg-primary transition-all duration-300 uppercase tracking-widest text-xs font-semibold cursor-pointer rounded-sm"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default DetalleProducto;
