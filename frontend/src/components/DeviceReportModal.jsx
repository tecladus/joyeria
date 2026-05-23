import { useState } from 'react';
import { useDeviceReport, useDeviceMultiplier } from '../services/deviceDetection';

function DeviceReportModal() {
  const [mostrar, setMostrar] = useState(false);
  const report = useDeviceReport();
  const multiplier = useDeviceMultiplier();

  const getTierColor = (tier) => {
    switch (tier) {
      case 'very-poor': return 'text-error';
      case 'poor': return 'text-warning';
      case 'average': return 'text-secondary';
      case 'good': return 'text-primary';
      case 'excellent': return 'text-success';
      default: return 'text-secondary';
    }
  };

  const getTierBgColor = (tier) => {
    switch (tier) {
      case 'very-poor': return 'bg-error/10 border-error/20';
      case 'poor': return 'bg-warning/10 border-warning/20';
      case 'average': return 'bg-surface-container-low border-outline-variant/20';
      case 'good': return 'bg-primary/10 border-primary/20';
      case 'excellent': return 'bg-success/10 border-success/20';
      default: return 'bg-surface-container-low border-outline-variant/20';
    }
  };

  return (
    <>
      {/* Botón para abrir modal */}
      <button
        onClick={() => setMostrar(true)}
        className="fixed bottom-8 left-8 w-14 h-14 rounded-full bg-primary text-background shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center font-label-caps text-xs tracking-wider uppercase font-semibold z-40 cursor-pointer border border-primary hover:bg-primary-dark"
        title="Ver ajuste de precio por dispositivo"
      >
        <span className="material-symbols-outlined">device_hub</span>
      </button>

      {/* Modal */}
      {mostrar && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-outline-variant/20 max-w-md w-full p-8 rounded-xl luxury-shadow space-y-6 animate-scale-up">

            {/* Encabezado */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display-lg text-2xl text-on-surface font-light mb-1">
                  Tu Dispositivo
                </h2>
                <p className="font-body-sm text-secondary text-xs">
                  Análisis de especificaciones
                </p>
              </div>
              <button
                onClick={() => setMostrar(false)}
                className="text-outline-variant hover:text-on-surface transition-colors cursor-pointer text-xl font-light bg-transparent border-0"
              >
                ✕
              </button>
            </div>

            {/* Tier y Multiplicador */}
            <div className={`border rounded-sm p-4 space-y-3 ${getTierBgColor(multiplier.tier)}`}>
              <div className={`font-label-caps text-xs tracking-widest uppercase font-semibold ${getTierColor(multiplier.tier)}`}>
                {multiplier.label}
              </div>
              <div className="flex items-end gap-2">
                <span className={`font-display-lg text-3xl font-light ${getTierColor(multiplier.tier)}`}>
                  {multiplier.multiplier.toFixed(2)}x
                </span>
                <span className="font-body-sm text-secondary text-xs mb-1">
                  multiplicador
                </span>
              </div>
              <p className="font-body-sm text-secondary text-xs">
                {multiplier.description}
              </p>
              <div className="text-[10px] text-outline font-body-md mt-2 pt-2 border-t border-current/20">
                Puntuación: {report.score.toFixed(0)}/100
              </div>
            </div>

            {/* Especificaciones */}
            <div className="space-y-3">
              <h3 className="font-label-caps text-[10px] tracking-widest text-outline uppercase font-semibold">
                Especificaciones Detectadas
              </h3>
              <div className="space-y-2">
                {/* CPU Cores */}
                <div className="flex items-center justify-between py-2 border-b border-outline-variant/10 text-sm">
                  <span className="font-body-sm text-secondary">Núcleos CPU</span>
                  <span className="font-body-md text-on-surface font-semibold">{report.specs.cores}</span>
                </div>

                {/* Memoria */}
                <div className="flex items-center justify-between py-2 border-b border-outline-variant/10 text-sm">
                  <span className="font-body-sm text-secondary">Memoria RAM</span>
                  <span className="font-body-md text-on-surface font-semibold">
                    {report.specs.memory ? `${report.specs.memory} GB` : 'No disponible'}
                  </span>
                </div>

                {/* Resolución */}
                <div className="flex items-center justify-between py-2 border-b border-outline-variant/10 text-sm">
                  <span className="font-body-sm text-secondary">Resolución</span>
                  <span className="font-body-md text-on-surface font-semibold">
                    {report.specs.resolution.width}x{report.specs.resolution.height}
                  </span>
                </div>

                {/* GPU */}
                <div className="flex items-center justify-between py-2 border-b border-outline-variant/10 text-sm">
                  <span className="font-body-sm text-secondary">GPU</span>
                  <span className="font-body-md text-on-surface font-semibold text-right text-xs max-w-[150px] truncate">
                    {report.specs.gpu !== 'unknown' ? report.specs.gpu : 'Integrada'}
                  </span>
                </div>

                {/* WebGL 2.0 */}
                <div className="flex items-center justify-between py-2 border-b border-outline-variant/10 text-sm">
                  <span className="font-body-sm text-secondary">WebGL 2.0</span>
                  <span className={`font-label-caps text-xs font-semibold ${
                    report.specs.gpu3d ? 'text-success' : 'text-warning'
                  }`}>
                    {report.specs.gpu3d ? 'Sí' : 'No'}
                  </span>
                </div>

                {/* Pantalla Táctil */}
                <div className="flex items-center justify-between py-2 text-sm">
                  <span className="font-body-sm text-secondary">Pantalla Táctil</span>
                  <span className={`font-label-caps text-xs font-semibold ${
                    report.specs.touchscreen ? 'text-primary' : 'text-outline'
                  }`}>
                    {report.specs.touchscreen ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Explicación */}
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-sm p-3 space-y-2">
              <p className="font-label-caps text-[10px] tracking-widest text-outline uppercase font-semibold">
                ¿Cómo se calcula?
              </p>
              <p className="font-body-sm text-secondary text-xs leading-relaxed">
                Analizamos tu CPU, memoria, GPU y pantalla. Los dispositivos premium pagan un poco más; los básicos obtienen descuento. Es nuestra forma de mantener precios justos en todas las plataformas.
              </p>
            </div>

            {/* Botón Cerrar */}
            <button
              onClick={() => setMostrar(false)}
              className="w-full py-3 bg-on-surface text-background font-label-caps text-label-caps hover:bg-primary transition-all duration-300 uppercase tracking-widest text-xs font-semibold cursor-pointer rounded-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default DeviceReportModal;
