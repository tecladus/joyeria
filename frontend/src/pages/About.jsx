import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { enviarMensajeContacto } from '../redux/slices/contactoSlice';

function About() {
  const location = useLocation();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const estaLogueado = !!auth.token;

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: 'Consulta sobre Diseño a Medida',
    mensaje: ''
  });

  const [mostrarModalContacto, setMostrarModalContacto] = useState(false);
  const [mostrarModalOficio, setMostrarModalOficio] = useState(false);
  const [pasoActivo, setPasoActivo] = useState(0);
  const [toastRedes, setToastRedes] = useState('');
  const [mapHovered, setMapHovered] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorContacto, setErrorContacto] = useState('');

  // Autofillar si ya está logueado
  useEffect(() => {
    if (estaLogueado) {
      setFormData((prev) => ({
        ...prev,
        nombre: `${auth.nombre || ''} ${auth.apellido || ''}`.trim(),
        email: auth.email || ''
      }));
    }
  }, [auth, estaLogueado]);

  // Auto-cerrar mensaje de error después de 5 segundos
  useEffect(() => {
    if (errorContacto) {
      const timer = setTimeout(() => {
        setErrorContacto('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorContacto]);

  const pasosOficio = [
    {
      titulo: '01. Diseño Conciliador',
      descripcion: 'Cada pieza comienza con esbozos detallados inspirados en la escultura moderna y la naturaleza minimalista, buscando un equilibrio perfecto entre la luz y el metal.',
      detalle: 'Nuestros diseñadores emplean técnicas de modelado digital tridimensional avanzadas combinadas con el dibujo manual clásico para definir proporciones áureas y grosores estructurales idóneos.'
    },
    {
      titulo: '02. Selección Rigurosa',
      descripcion: 'Seleccionamos metales 100% reciclados y gemas preciosas de origen ético, inspeccionando cada piedra individualmente por su claridad, color y procedencia.',
      detalle: 'Cada diamante y gema de color cuenta con certificación de conflicto libre e informe de trazabilidad completa. Solo el 1% superior de los metales y gemas califica para nuestras piezas.'
    },
    {
      titulo: '03. Engaste de Precisión',
      descripcion: 'Nuestros maestros joyeros engastan las gemas a mano bajo microscopio de alta definición, garantizando la durabilidad y máxima refracción lumínica de cada faceta.',
      detalle: 'Utilizando técnicas de engaste de grano, garra y pavé francés, el metal se esculpe delicadamente alrededor de cada piedra para maximizar su exposición lumínica sin comprometer la seguridad.'
    },
    {
      titulo: '04. Pulido Maestro',
      descripcion: 'Terminamos cada joya con técnicas de pulido tradicionales, alternando cepillados satinados y espejados para crear texturas ricas y destellos etéreos.',
      detalle: 'El proceso final involucra múltiples etapas de pulido ultrafino con compuestos orgánicos y discos de algodón suave, logrando el brillo característico que define la estética de Aura.'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setErrorContacto('');
    try {
      await dispatch(enviarMensajeContacto(formData)).unwrap();
      setMostrarModalContacto(true);
    } catch (err) {
      setErrorContacto(err.message || err || 'Error al enviar el mensaje. Intente de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const handleRedesClick = (red) => {
    setToastRedes(`Conectando con el canal de ${red} oficial de Aura...`);
    setTimeout(() => setToastRedes(''), 3000);
  };

  useEffect(() => {
    if (location.hash === '#contact') {
      const element = document.getElementById('contact');
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background text-on-surface pt-32 pb-section-gap">
      <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop relative">
        
        {/* 1. Header & Story Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32">
          <div className="space-y-6">
            <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase block text-xs">
              Establecido en 1994
            </span>
            <h1 className="font-display-lg text-4xl md:text-6xl text-on-surface leading-tight font-light">
              El Arte de lo <br />No Dicho
            </h1>
            <p className="font-body-lg text-secondary leading-relaxed font-light">
              Aura nació del deseo de volver a la esencia del adorno. Fundada en un pequeño atelier costero, nuestra herencia tiene sus raíces en la creencia de que la joyería debe sentirse, no solo verse. Cada pieza es una declaración silenciosa de fuerza y sofisticación, diseñada para trascender generaciones.
            </p>
          </div>
          <div className="overflow-hidden aspect-square md:aspect-[4/3] bg-surface-container-low rounded-lg border border-outline-variant/10">
            <img
              className="w-full h-full object-cover select-none grayscale"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuADKa9h_aHbjagV89hae4PYWA6Xq6zFvrBuyi4PC64wp7nX-Sha9aGU22cwSpUFB7j98bc5Uhhx2bF0WR40siw-v2UfYCLdQ52KDp_FkkSZfAtX87pMpKa9v3_8cMcNeM2s90DzGIqQm3ujzZwfuElev4VmPhnhcbZsfvLIjdd0d20Bq_Vjw2BkH_wWyHw_XZIohYnhnrPBM7RKEYqLvcgrIU-PoLBJ53MnCqcjDnZhwLIU4juE6mjkcSyziunqdPDeTakygWvmATE"
              alt="Proceso de diseño de joyería"
            />
          </div>
        </section>

        {/* Watermark Heritage */}
        <div className="absolute top-[28%] left-0 right-0 text-center pointer-events-none select-none overflow-hidden z-0 hidden lg:block">
          <span className="font-display-lg text-[180px] text-outline/[0.03] tracking-[0.2em] uppercase font-light leading-none block">
            HERENCIA
          </span>
        </div>

        {/* 2. Manifesto: Purity in Process */}
        <section className="relative z-10 border-t border-outline-variant/20 pt-20 mb-32">
          <div className="text-center mb-16">
            <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase block mb-3 text-xs">
              Nuestros Principios
            </span>
            <h2 className="font-display-lg text-3xl md:text-5xl text-on-surface font-light">Pureza en el Proceso</h2>
            <div className="w-12 h-[1px] bg-primary mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="space-y-4">
              <h3 className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest text-xs font-semibold">
                Oro Reciclado
              </h3>
              <p className="font-body-md text-secondary leading-relaxed font-light text-sm">
                Utilizamos exclusivamente oro de 18 quilates y platino 100% reciclados, eliminando los impactos ambientales y sociales de la minería tradicional sin comprometer la calidad ni el brillo de la pieza.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest text-xs font-semibold">
                Gemas Trazables
              </h3>
              <p className="font-body-md text-secondary leading-relaxed font-light text-sm">
                Cada piedra de nuestra colección es seleccionada a mano y es completamente rastreable desde la mina hasta el mercado, adhiriéndose a estrictos protocolos éticos y garantías de libre conflicto.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest text-xs font-semibold">
                Trato Justo
              </h3>
              <p className="font-body-md text-secondary leading-relaxed font-light text-sm">
                Nuestros maestros artesanos son socios de por vida. Garantizamos condiciones de trabajo seguras e inspiradoras, salarios justos y apoyamos activamente el legado de las técnicas de joyería tradicional.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Mid Banner: The Human Touch */}
        <section className="relative h-[450px] overflow-hidden rounded-xl border border-outline-variant/10 mb-32 group">
          <img
            className="w-full h-full object-cover grayscale brightness-90 group-hover:scale-105 transition-transform duration-[1200ms] ease-out select-none"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuADKa9h_aHbjagV89hae4PYWA6Xq6zFvrBuyi4PC64wp7nX-Sha9aGU22cwSpUFB7j98bc5Uhhx2bF0WR40siw-v2UfYCLdQ52KDp_FkkSZfAtX87pMpKa9v3_8cMcNeM2s90DzGIqQm3ujzZwfuElev4VmPhnhcbZsfvLIjdd0d20Bq_Vjw2BkH_wWyHw_XZIohYnhnrPBM7RKEYqLvcgrIU-PoLBJ53MnCqcjDnZhwLIU4juE6mjkcSyziunqdPDeTakygWvmATE"
            alt="Mesa de trabajo del atelier"
          />
          <div className="absolute inset-0 bg-black/45 flex flex-col justify-center items-center text-center p-6">
            <h2 className="font-display-lg text-4xl md:text-5xl text-white mb-6 font-light">El Toque Humano</h2>
            <p className="font-body-lg text-white/80 max-w-xl mb-8 font-light text-sm md:text-base">
              Cada pieza de alta joyería de Aura pasa por las manos de un único maestro artesano de principio a fin. Este enfoque dedicado garantiza que se preserven las sutiles intenciones del diseño, creando una conexión profunda y única.
            </p>
            <button 
              onClick={() => setMostrarModalOficio(true)}
              className="font-label-caps text-label-caps text-white border-b border-white/50 pb-1 hover:border-primary transition-colors tracking-widest uppercase text-xs font-semibold cursor-pointer bg-transparent"
            >
              Explorar el Oficio →
            </button>
          </div>
        </section>

        {/* 4. Get in Touch Form & Address Details */}
        <section id="contact" className="border-t border-outline-variant/20 pt-20 scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            
            {/* Form Column */}
            <div className="lg:col-span-7 space-y-10">
              <div>
                <h2 className="font-display-lg text-3xl md:text-4xl text-on-surface mb-4 font-light">
                  Contacto
                </h2>
                <p className="font-body-md text-secondary leading-relaxed max-w-xl font-light">
                  Nuestros asesores están disponibles para consultas privadas, solicitudes de diseño a medida y visitas a nuestra sala de exposición.
                </p>
              </div>

              {errorContacto && (
                <div className="bg-error-container border border-error text-on-error-container p-4 rounded mb-6 font-body-md text-sm flex justify-between items-center animate-fade-in">
                  <span>{errorContacto}</span>
                  <button
                    type="button"
                    onClick={() => setErrorContacto('')}
                    className="bg-transparent border-0 text-on-error-container cursor-pointer font-bold font-body-md text-sm pl-2"
                  >
                    ✕
                  </button>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="relative">
                    <input
                      type="text"
                      required
                      disabled={estaLogueado}
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      className="w-full bg-transparent border-0 border-b border-outline py-3 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/40 font-body-md text-on-surface disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Nombre Completo"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      disabled={estaLogueado}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-transparent border-0 border-b border-outline py-3 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/40 font-body-md text-on-surface disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Correo Electrónico"
                    />
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={formData.asunto}
                    onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                    className="w-full bg-transparent border-0 border-b border-outline py-3 px-0 focus:ring-0 focus:border-primary text-secondary font-body-md cursor-pointer"
                  >
                    <option value="Consulta sobre Diseño a Medida">Consulta sobre Diseño a Medida</option>
                    <option value="Consulta para Showroom Privado">Consulta para Showroom Privado</option>
                    <option value="Prensa y Relaciones Públicas">Prensa y Relaciones Públicas</option>
                    <option value="Consultas Generales">Consultas Generales</option>
                  </select>
                </div>

                <div className="relative">
                  <textarea
                    rows={4}
                    required
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    className="w-full bg-transparent border-0 border-b border-outline py-3 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/40 font-body-md resize-none text-on-surface"
                    placeholder="Su Mensaje"
                  />
                </div>

                <button
                  type="submit"
                  disabled={enviando}
                  className="font-label-caps text-label-caps bg-on-surface text-background px-10 py-4 hover:bg-primary hover:text-white transition-colors tracking-widest uppercase text-xs font-semibold cursor-pointer rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enviando ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </form>
            </div>

            {/* Address Details & Map Column */}
            <div className="lg:col-span-5 space-y-12">
              <div className="space-y-6">
                <div>
                  <h4 className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest mb-3 text-xs font-semibold">
                    El Atelier
                  </h4>
                  <p className="font-body-md text-secondary leading-relaxed font-light">
                    Lima 757, Monserrat<br />
                    CABA, Argentina (C1073)
                  </p>
                </div>

                <div>
                  <h4 className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest mb-3 text-xs font-semibold">
                    Conexión
                  </h4>
                  <p className="font-body-md text-secondary leading-relaxed space-y-1 font-light">
                    <a href="mailto:grupo11@uade.edu.ar" className="block hover:text-primary transition-colors">
                      grupo11@uade.edu.ar
                    </a>
                  </p>
                </div>

                <div className="flex gap-4 pt-2">
                  <span
                    onClick={() => handleRedesClick('Instagram')}
                    className="material-symbols-outlined text-secondary hover:text-primary cursor-pointer transition-colors text-xl"
                  >
                    public
                  </span>
                  <span
                    onClick={() => handleRedesClick('Pinterest')}
                    className="material-symbols-outlined text-secondary hover:text-primary cursor-pointer transition-colors text-xl"
                  >
                    share
                  </span>
                  <a
                    href="mailto:grupo11@uade.edu.ar"
                    className="material-symbols-outlined text-secondary hover:text-primary cursor-pointer transition-colors text-xl"
                  >
                    mail
                  </a>
                </div>
              </div>

              {/* Google Map de UADE Estilizado */}
              <div className="relative aspect-[4/3] w-full bg-surface-container-high border border-outline-variant/15 rounded-lg overflow-hidden shadow-inner">
                {/* 1. El mapa (sin interactividad) */}
                <iframe
                  title="Ubicación Atelier Aura - UADE"
                  // He añadido &iwloc=near a la URL para simplificar más la vista si lo deseas
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.4735237227447!2d-58.3844935!3d-34.6170436!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccaba6ac89b35%3A0x1a2dc24cbca665a7!2sUADE!5e0!3m2!1ses-419!2sar!4v1716320000000!5m2!1ses-419!2sar"
                  width="100%"
                  height="100%"
                  style={{
                    border: 0,
                    filter: 'grayscale(100%) sepia(20%) contrast(90%) brightness(95%)',
                  }}
                  loading="lazy"
                ></iframe>

                {/* 2. Capa transparente que bloquea la interacción y redirige */}
                <a
                  href="https://www.google.com/maps/place/UADE/@-34.6181789,-58.3837424,17z/data=!3m1!4b1!4m6!3m5!1s0x95bccb28ea8781cb:0xb791570f7236c962!8m2!3d-34.6181789!4d-58.3811675"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 z-10 cursor-pointer"
                  aria-label="Ver ubicación en Google Maps"
                >
                  {/* Este div está vacío, solo sirve para cubrir el mapa */}
                </a>
              </div>
            </div>

          </div>
        </section>

      </div>

      {/* Modal de Explorar el Oficio */}
      {mostrarModalOficio && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-outline-variant/20 max-w-2xl w-full p-8 rounded-xl luxury-shadow space-y-6 animate-scale-up">
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
              <div>
                <span className="font-label-caps text-[10px] text-primary tracking-widest uppercase block mb-1">
                  El Arte de la Creación
                </span>
                <h2 className="font-display-lg text-2xl text-on-surface font-light">
                  Proceso de Manufactura Artesanal
                </h2>
              </div>
              <button 
                onClick={() => setMostrarModalOficio(false)}
                className="material-symbols-outlined text-secondary hover:text-primary bg-transparent border-0 cursor-pointer text-xl"
              >
                close
              </button>
            </div>

            {/* Proceso interactivo */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[220px]">
              {/* Sidebar de pasos */}
              <div className="md:col-span-4 flex md:flex-col gap-2 border-b md:border-b-0 md:border-r border-outline-variant/10 pb-4 md:pb-0 pr-0 md:pr-4 overflow-x-auto md:overflow-x-visible">
                {pasosOficio.map((paso, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPasoActivo(idx)}
                    className={`text-left px-3 py-2.5 rounded font-label-caps text-[11px] tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap md:whitespace-normal w-full ${
                      pasoActivo === idx
                        ? 'bg-primary/10 text-primary border-l-2 border-primary font-semibold'
                        : 'text-secondary hover:text-on-surface hover:bg-surface-container-low border-l-2 border-transparent'
                    }`}
                  >
                    {paso.titulo.substring(4)}
                  </button>
                ))}
              </div>

              {/* Detalle del paso */}
              <div className="md:col-span-8 space-y-4 flex flex-col justify-center">
                <span className="font-label-caps text-[10px] text-primary tracking-widest uppercase block font-semibold">
                  Paso {pasosOficio[pasoActivo].titulo.split('.')[0]}
                </span>
                <h3 className="font-display-lg text-xl text-on-surface font-light">
                  {pasosOficio[pasoActivo].titulo.substring(4)}
                </h3>
                <p className="font-body-md text-on-surface-variant text-xs leading-relaxed font-light">
                  {pasosOficio[pasoActivo].descripcion}
                </p>
                <p className="font-body-md text-secondary text-[11px] leading-relaxed font-light italic">
                  {pasosOficio[pasoActivo].detalle}
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-outline-variant/10 pt-4">
              <button
                onClick={() => setMostrarModalOficio(false)}
                className="px-8 py-3 bg-on-surface text-background font-label-caps text-label-caps hover:bg-primary transition-all duration-300 uppercase tracking-widest text-xs font-semibold cursor-pointer rounded-sm"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Contacto Exitoso */}
      {mostrarModalContacto && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-outline-variant/20 max-w-md w-full p-8 text-center rounded-xl luxury-shadow space-y-6 animate-scale-up">
            <div className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto text-3xl font-light">
              ◇
            </div>
            
            <div className="space-y-2">
              <h2 className="font-display-lg text-2xl text-on-surface font-light">Mensaje Enviado</h2>
              <p className="font-body-md text-secondary leading-relaxed text-sm font-light">
                Gracias por contactarte con el Atelier de Aura, <strong className="text-on-surface font-medium">{formData.nombre}</strong>.
              </p>
              <p className="font-body-md text-secondary leading-relaxed text-xs font-light">
                Hemos recibido tu solicitud sobre <strong className="text-on-surface font-medium">"{formData.asunto}"</strong>. Un asesor de nuestro equipo se pondrá en contacto contigo a la brevedad.
              </p>
            </div>

            <button
              onClick={() => {
                setMostrarModalContacto(false);
                setFormData({ nombre: '', email: '', asunto: 'Consulta sobre Diseño a Medida', mensaje: '' });
              }}
              className="w-full py-4 bg-on-surface text-background font-label-caps text-label-caps hover:bg-primary transition-all duration-300 uppercase tracking-widest text-xs font-semibold cursor-pointer rounded-sm"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Toast Flotante de Redes */}
      {toastRedes && (
        <div className="fixed bottom-8 left-8 z-50 bg-on-surface text-background px-6 py-4 rounded shadow-2xl font-label-caps text-[11px] tracking-widest uppercase border border-outline-variant/30 animate-fade-in flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-sm font-light">share</span>
          {toastRedes}
        </div>
      )}
    </div>
  );
}

export default About;
