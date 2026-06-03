import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCarrito, modificarCantidadItem, eliminarDelCarrito, hacerCheckout } from '../services/api';
import CarritoItem from '../components/CarritoItem';
import { setCantidadCarrito } from '../redux/slices/carritoSlice';
import { adjustPriceByDevice, deviceDetector } from '../services/deviceDetection';

const formatearPrecio = (precio) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(precio);

function Carrito() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const [carrito, setCarrito] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [operando, setOperando] = useState(false);
  const [error, setError] = useState('');
  const [checkoutExitoso, setCheckoutExitoso] = useState(false);
  const [inicializado, setInicializado] = useState(false);

  // Estados de Checkout / Pago
  const [paso, setPaso] = useState('carrito'); // 'carrito' o 'pago'
  const [datosEnvio, setDatosEnvio] = useState({
    nombreCompleto: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    telefono: '',
  });
  const [metodoPago, setMetodoPago] = useState('tarjeta'); // 'tarjeta', 'transferencia', 'efectivo'
  const [datosTarjeta, setDatosTarjeta] = useState({
    numero: '',
    nombre: '',
    vencimiento: '',
    cvv: '',
  });
  const [transferenciaConfirmada, setTransferenciaConfirmada] = useState(false);

  // Pre-cargar datos de la cuenta logueada en el formulario de envío una sola vez
  useEffect(() => {
    if (auth && !inicializado && auth.nombre) {
      setDatosEnvio({
        nombreCompleto: `${auth.nombre || ''} ${auth.apellido || ''}`.trim(),
        direccion: auth.direccion || '',
        ciudad: '',
        codigoPostal: '',
        telefono: auth.telefono || '',
      });
      setInicializado(true);
    }
  }, [auth, inicializado]);

  const cargarCarrito = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const datos = await getCarrito(auth.idUsuario);
      setCarrito(datos);
      const total = datos?.items?.reduce((s, i) => s + i.cantidad, 0) || 0;
      dispatch(setCantidadCarrito(total));
    } catch (err) {
      setError(err.message || 'No se pudo cargar el carrito.');
    } finally {
      setCargando(false);
    }
  }, [auth.idUsuario, dispatch]);

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
      dispatch(setCantidadCarrito(total));
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
        dispatch(setCantidadCarrito(total));
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
    // Validaciones de Envío y Pago
    if (paso === 'pago') {
      if (!datosEnvio.nombreCompleto.trim() || !datosEnvio.direccion.trim() || !datosEnvio.ciudad.trim() || !datosEnvio.codigoPostal.trim() || !datosEnvio.telefono.trim()) {
        setError('Por favor, completa todos los campos del envío.');
        return;
      }
      if (metodoPago === 'tarjeta') {
        if (!datosTarjeta.numero.trim() || !datosTarjeta.nombre.trim() || !datosTarjeta.vencimiento.trim() || !datosTarjeta.cvv.trim()) {
          setError('Por favor, completa todos los datos de la tarjeta.');
          return;
        }
        if (datosTarjeta.numero.replace(/\s/g, '').length < 16) {
          setError('El número de tarjeta debe tener 16 dígitos.');
          return;
        }
        if (datosTarjeta.cvv.length < 3) {
          setError('El código CVV debe tener al menos 3 dígitos.');
          return;
        }
      }
      if (metodoPago === 'transferencia' && !transferenciaConfirmada) {
        setError('Por favor, declara haber realizado la transferencia bancaria para continuar.');
        return;
      }
    }

    setOperando(true);
    setError('');
    try {
      const datosCheckout = {
        metodoPago,
        nombreCompleto: datosEnvio.nombreCompleto,
        direccion: datosEnvio.direccion,
        ciudad: datosEnvio.ciudad,
        codigoPostal: datosEnvio.codigoPostal,
        telefono: datosEnvio.telefono,
        multiplicadorDispositivo: deviceDetector.multiplier.multiplier
      };
      await hacerCheckout(auth.idUsuario, datosCheckout);
      setCheckoutExitoso(true);
      dispatch(setCantidadCarrito(0));
    } catch (err) {
      setError(err.message || 'Error al procesar el pedido.');
    } finally {
      setOperando(false);
    }
  };

  const items = carrito?.items || [];
  const total = items.reduce((s, i) => s + (adjustPriceByDevice(i.precioUnitario) * i.cantidad), 0);
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
            
            {/* Lista de Items / Formulario de Pago */}
            {paso === 'pago' ? (
              <div className="lg:col-span-2 bg-surface-container-low p-6 md:p-8 border border-outline-variant/10 rounded-xl space-y-8 animate-fade-in">
                {/* Botón de volver */}
                <button
                  onClick={() => {
                    setPaso('carrito');
                    setError('');
                  }}
                  className="flex items-center gap-2 font-label-caps text-xs text-secondary hover:text-primary transition-colors uppercase tracking-widest bg-transparent border-0 cursor-pointer p-0"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Volver a la Bolsa
                </button>

                <div>
                  <h2 className="font-display-lg text-2xl text-on-surface font-light mb-1">Detalles del Envío</h2>
                  <p className="font-body-md text-xs text-outline font-light">
                    Por favor ingresa la dirección donde deseas recibir tu pieza exclusiva de Aura.
                  </p>
                </div>

                {/* Formulario de Envio */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="nombreCompleto">
                      Nombre Completo *
                    </label>
                    <input
                      id="nombreCompleto"
                      type="text"
                      required
                      placeholder="Ej: Sofía Rodríguez"
                      className="bg-transparent border-0 border-b border-outline/30 py-2 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/20 font-body-md text-on-surface text-sm"
                      value={datosEnvio.nombreCompleto}
                      onChange={(e) => setDatosEnvio({ ...datosEnvio, nombreCompleto: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="telefono">
                      Teléfono de Contacto *
                    </label>
                    <input
                      id="telefono"
                      type="tel"
                      required
                      placeholder="Ej: +54 9 11 1234 5678"
                      className="bg-transparent border-0 border-b border-outline/30 py-2 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/20 font-body-md text-on-surface text-sm"
                      value={datosEnvio.telefono}
                      onChange={(e) => setDatosEnvio({ ...datosEnvio, telefono: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col md:col-span-2">
                    <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="direccion">
                      Dirección de Entrega *
                    </label>
                    <input
                      id="direccion"
                      type="text"
                      required
                      placeholder="Calle, número, departamento o piso"
                      className="bg-transparent border-0 border-b border-outline/30 py-2 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/20 font-body-md text-on-surface text-sm"
                      value={datosEnvio.direccion}
                      onChange={(e) => setDatosEnvio({ ...datosEnvio, direccion: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="ciudad">
                      Ciudad / Provincia *
                    </label>
                    <input
                      id="ciudad"
                      type="text"
                      required
                      placeholder="Ej: Palermo, CABA"
                      className="bg-transparent border-0 border-b border-outline/30 py-2 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/20 font-body-md text-on-surface text-sm"
                      value={datosEnvio.ciudad}
                      onChange={(e) => setDatosEnvio({ ...datosEnvio, ciudad: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="codigoPostal">
                      Código Postal *
                    </label>
                    <input
                      id="codigoPostal"
                      type="text"
                      required
                      placeholder="Ej: C1425FDB"
                      className="bg-transparent border-0 border-b border-outline/30 py-2 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/20 font-body-md text-on-surface text-sm"
                      value={datosEnvio.codigoPostal}
                      onChange={(e) => setDatosEnvio({ ...datosEnvio, codigoPostal: e.target.value })}
                    />
                  </div>
                </div>

                {/* Sección de Métodos de Pago */}
                <div className="border-t border-outline-variant/10 pt-8 space-y-6">
                  <div>
                    <h2 className="font-display-lg text-2xl text-on-surface font-light mb-1">Método de Pago</h2>
                    <p className="font-body-md text-xs text-outline font-light">
                      Selecciona tu opción de pago preferida para concretar la compra.
                    </p>
                  </div>

                  {/* Selectores de pago */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Tarjeta */}
                    <div
                      onClick={() => { setMetodoPago('tarjeta'); setError(''); }}
                      className={`p-5 border rounded-lg cursor-pointer flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 select-none ${
                        metodoPago === 'tarjeta'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-outline-variant/40 hover:border-outline text-secondary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl font-light">credit_card</span>
                      <span className="font-label-caps text-[10px] font-semibold tracking-wider uppercase">Tarjeta</span>
                    </div>

                    {/* Transferencia */}
                    <div
                      onClick={() => { setMetodoPago('transferencia'); setError(''); }}
                      className={`p-5 border rounded-lg cursor-pointer flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 select-none ${
                        metodoPago === 'transferencia'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-outline-variant/40 hover:border-outline text-secondary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl font-light">account_balance</span>
                      <span className="font-label-caps text-[10px] font-semibold tracking-wider uppercase">Transferencia</span>
                    </div>

                    {/* Efectivo */}
                    <div
                      onClick={() => { setMetodoPago('efectivo'); setError(''); }}
                      className={`p-5 border rounded-lg cursor-pointer flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 select-none ${
                        metodoPago === 'efectivo'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-outline-variant/40 hover:border-outline text-secondary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl font-light">storefront</span>
                      <span className="font-label-caps text-[10px] font-semibold tracking-wider uppercase">Pago al Retirar</span>
                    </div>
                  </div>

                  {/* Formulario Dinámico de Pago */}
                  <div className="bg-surface-container-lowest p-6 border border-outline-variant/10 rounded-lg">
                    {metodoPago === 'tarjeta' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-body-md">
                        <div className="flex flex-col md:col-span-2">
                          <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="cardNumero">
                            Número de Tarjeta
                          </label>
                          <input
                            id="cardNumero"
                            type="text"
                            maxLength="19"
                            placeholder="0000 0000 0000 0000"
                            className="bg-transparent border-0 border-b border-outline/30 py-2 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/20 font-body-md text-on-surface text-sm"
                            value={datosTarjeta.numero}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                              setDatosTarjeta({ ...datosTarjeta, numero: value });
                            }}
                          />
                        </div>

                        <div className="flex flex-col">
                          <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="cardNombre">
                            Nombre en la Tarjeta
                          </label>
                          <input
                            id="cardNombre"
                            type="text"
                            placeholder="Ej: SOFIA RODRIGUEZ"
                            className="bg-transparent border-0 border-b border-outline/30 py-2 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/20 font-body-md text-on-surface text-sm uppercase"
                            value={datosTarjeta.nombre}
                            onChange={(e) => setDatosTarjeta({ ...datosTarjeta, nombre: e.target.value.toUpperCase() })}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col">
                            <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="cardVencimiento">
                              Vencimiento
                            </label>
                            <input
                              id="cardVencimiento"
                              type="text"
                              maxLength="5"
                              placeholder="MM/YY"
                              className="bg-transparent border-0 border-b border-outline/30 py-2 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/20 font-body-md text-on-surface text-sm text-center"
                              value={datosTarjeta.vencimiento}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '');
                                if (value.length > 2) {
                                  value = value.substring(0, 2) + '/' + value.substring(2, 4);
                                }
                                setDatosTarjeta({ ...datosTarjeta, vencimiento: value });
                              }}
                            />
                          </div>

                          <div className="flex flex-col">
                            <label className="font-label-caps text-[10px] text-outline uppercase tracking-wider mb-1" htmlFor="cardCVV">
                              CVV *
                            </label>
                            <input
                              id="cardCVV"
                              type="password"
                              maxLength="4"
                              placeholder="000"
                              className="bg-transparent border-0 border-b border-outline/30 py-2 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/20 font-body-md text-on-surface text-sm text-center"
                              value={datosTarjeta.cvv}
                              onChange={(e) => setDatosTarjeta({ ...datosTarjeta, cvv: e.target.value.replace(/\D/g, '') })}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {metodoPago === 'transferencia' && (
                      <div className="space-y-6 text-sm font-body-md">
                        <div className="space-y-3 border-b border-outline-variant/10 pb-4">
                          <span className="font-label-caps text-[10px] text-outline uppercase tracking-wider block">Datos del Atelier</span>
                          <div className="grid grid-cols-2 gap-y-2 text-xs">
                            <span className="text-secondary">Banco:</span>
                            <span className="font-medium text-on-surface text-right">Banco Galicia</span>

                            <span className="text-secondary">CBU / CVU:</span>
                            <span className="font-medium text-on-surface text-right select-all">0070002200000004561234</span>

                            <span className="text-secondary">Alias:</span>
                            <span className="font-medium text-primary text-right select-all">aura.joyas.fine</span>

                            <span className="text-secondary">CUIT:</span>
                            <span className="font-medium text-on-surface text-right">30-71728394-9</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <input
                            id="checkTransferencia"
                            type="checkbox"
                            className="mt-1 text-primary focus:ring-primary border-outline-variant bg-transparent rounded cursor-pointer"
                            checked={transferenciaConfirmada}
                            onChange={(e) => setTransferenciaConfirmada(e.target.checked)}
                          />
                          <label htmlFor="checkTransferencia" className="text-xs text-secondary leading-normal cursor-pointer select-none">
                            Declaro haber realizado la transferencia bancaria por el total de <strong className="text-on-surface">{formatearPrecio(total)}</strong> a la cuenta indicada.
                          </label>
                        </div>
                      </div>
                    )}

                    {metodoPago === 'efectivo' && (
                      <div className="space-y-4 text-xs font-body-md text-secondary leading-relaxed">
                        <div className="flex items-center gap-2 text-primary font-medium">
                          <span className="material-symbols-outlined text-lg font-light">workspace_premium</span>
                          <span className="font-label-caps text-[10px] font-semibold tracking-wider uppercase">Boutique de Retiro</span>
                        </div>
                        <p>
                          Puedes retirar tu pedido sin cargo en nuestra boutique exclusiva ubicada en:
                          <strong className="text-on-surface font-medium block mt-1">Av. Alvear 1890, Recoleta, CABA.</strong>
                        </p>
                        <p>
                          ⏰ <strong>Horarios:</strong> Lunes a Viernes de 10:00 a 19:00, Sábados de 10:00 a 14:00.
                        </p>
                        <p className="border-t border-outline-variant/10 pt-3">
                          💡 <em>Presenta tu DNI y el número de confirmación al retirar tu pieza.</em>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Lista de Items */
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
            )}

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
                  {paso === 'pago' ? (
                    <span className="text-success font-medium uppercase tracking-widest text-[10px]">Gratuito</span>
                  ) : (
                    <span className="text-primary-container font-medium uppercase tracking-widest text-[11px]">A confirmar</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center text-base font-semibold text-on-surface">
                <span>Total Estimado</span>
                <span className="font-display-lg text-xl text-primary">{formatearPrecio(total)}</span>
              </div>

              {paso === 'carrito' ? (
                <button
                  onClick={() => {
                    setPaso('pago');
                    setError('');
                    window.scrollTo(0, 0);
                  }}
                  disabled={items.length === 0}
                  className="w-full py-5 bg-on-surface text-background font-label-caps text-label-caps hover:bg-primary transition-all duration-300 disabled:opacity-50 disabled:hover:bg-on-surface disabled:cursor-not-allowed uppercase tracking-widest text-center block cursor-pointer border border-transparent"
                >
                  Proceder al Pago
                </button>
              ) : (
                <button
                  onClick={handleCheckout}
                  disabled={operando || items.length === 0}
                  className="w-full py-5 bg-on-surface text-background font-label-caps text-label-caps hover:bg-primary transition-all duration-300 disabled:opacity-50 disabled:hover:bg-on-surface disabled:cursor-not-allowed uppercase tracking-widest text-center block cursor-pointer border border-transparent"
                >
                  {operando ? 'Confirmando...' : 'Confirmar y Pagar'}
                </button>
              )}

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
