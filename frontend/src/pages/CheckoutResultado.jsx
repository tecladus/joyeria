import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { confirmarPago } from '../redux/slices/ordenesSlice';

function CheckoutResultado() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');
  const paymentId = searchParams.get('payment_id');
  const simulado = searchParams.get('simulado') === 'true';

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [orden, setOrden] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (!externalReference) {
      setError('Referencia de orden no encontrada.');
      setCargando(false);
      return;
    }

    const procesarConfirmacion = async () => {
      try {
        const res = await dispatch(confirmarPago({ ordenId: externalReference, status: status || 'approved' })).unwrap();
        setOrden(res);
      } catch (err) {
        setError(err.message || err || 'Ocurrió un error al procesar el pago.');
      } finally {
        setCargando(false);
      }
    };

    procesarConfirmacion();
  }, [externalReference, status, dispatch]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-on-surface">
        <div className="text-center space-y-4">
          <p className="font-label-caps text-label-caps text-primary tracking-widest animate-pulse text-xs">
            Confirmando transacción con el Atelier...
          </p>
        </div>
      </div>
    );
  }

  const esExitoso = status === 'approved' || status === 'success' || simulado;

  return (
    <div className="min-h-screen pb-20 pt-32 bg-background text-on-surface flex items-center justify-center">
      <main className="max-w-md w-full mx-auto px-6 text-center space-y-8 animate-fade-in">
        
        {esExitoso ? (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-success-container/10 border border-success/35 text-success rounded-full flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-3xl">done</span>
            </div>
            
            <div className="space-y-3">
              <span className="font-label-caps text-[10px] text-primary uppercase tracking-widest block font-semibold">
                Transacción Completada
              </span>
              <h1 className="font-display-lg text-3xl font-light text-on-background">
                ¡Gracias por tu compra!
              </h1>
              <p className="font-body-md text-sm text-secondary leading-relaxed font-light">
                Tu pago ha sido procesado de manera segura. Hemos enviado un correo electrónico de confirmación con los detalles del pedido.
              </p>
            </div>

            {orden && (
              <div className="bg-surface-container-low border border-outline-variant/15 rounded-lg p-5 text-left text-xs space-y-3 font-body-md">
                <div className="flex justify-between">
                  <span className="text-outline">Orden:</span>
                  <span className="font-semibold text-on-surface">#{orden.idOrden}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Total:</span>
                  <span className="font-semibold text-primary">USD {orden.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Destinatario:</span>
                  <span className="text-on-surface">{orden.nombreCompleto}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Entrega:</span>
                  <span className="text-on-surface text-right max-w-[200px] truncate">{orden.direccion}, {orden.ciudad}</span>
                </div>
                {paymentId && (
                  <div className="flex justify-between border-t border-outline-variant/10 pt-2 text-[10px]">
                    <span className="text-outline">ID de Pago MP:</span>
                    <span className="text-secondary select-all">{paymentId}</span>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 space-y-3">
              <Link
                to="/compras"
                className="block w-full py-4 bg-on-surface text-background font-label-caps text-xs tracking-widest uppercase hover:bg-primary hover:text-white transition-all duration-300 rounded-sm font-semibold text-center"
              >
                Ver Mis Compras
              </Link>
              <Link
                to="/productos"
                className="block w-full py-4 border border-outline-variant/35 text-secondary font-label-caps text-xs tracking-widest uppercase hover:border-primary hover:text-on-surface transition-all duration-300 rounded-sm text-center"
              >
                Volver a la Tienda
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-16 h-16 bg-error-container/10 border border-error/35 text-error rounded-full flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-3xl">close</span>
            </div>
            
            <div className="space-y-3">
              <span className="font-label-caps text-[10px] text-error uppercase tracking-widest block font-semibold">
                Pago Rechazado o Cancelado
              </span>
              <h1 className="font-display-lg text-3xl font-light text-on-background">
                Error en el Proceso de Pago
              </h1>
              <p className="font-body-md text-sm text-secondary leading-relaxed font-light">
                {error || 'No pudimos verificar el pago de tu orden. Por favor, vuelve a intentarlo o ponte en contacto con nuestro equipo de soporte.'}
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <Link
                to="/carrito"
                className="block w-full py-4 bg-on-surface text-background font-label-caps text-xs tracking-widest uppercase hover:bg-primary hover:text-white transition-all duration-300 rounded-sm font-semibold text-center"
              >
                Volver al Carrito
              </Link>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default CheckoutResultado;
