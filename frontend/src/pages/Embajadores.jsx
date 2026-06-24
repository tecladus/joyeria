import { useState, useEffect, useRef, useCallback } from 'react';

/*
 * ─────────────────────────────────────────────────────────────────────────────
 *  EMBAJADORES DE AURA  ·  Carrusel de testimonios
 * ─────────────────────────────────────────────────────────────────────────────
 *  CÓMO AGREGAR / CAMBIAR LAS FOTOS:
 *  1) Poné la imagen en  frontend/public/embajadores/  (ej: messi.jpg)
 *     y usá la ruta:      foto: '/embajadores/messi.jpg'
 *     — o pegá directamente una URL externa:  foto: 'https://...'
 *  2) Si 'foto' queda vacío ('') se muestra un placeholder elegante.
 *
 *  El PRIMER slide muestra el VIDEO de campaña acompañado del testimonio de
 *  Mirtha Legrand (constante MIRTHA, abajo). El video no lleva foto.
 *
 *  NOTA ACADÉMICA: las personas son reales, pero los testimonios, las piezas y
 *  su asociación con la marca son FICTICIOS, creados para el TPO de UADE.
 *  El aviso aparece al pie de la página.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Testimonio que acompaña al video de campaña (primer slide).
const MIRTHA = {
  nombre: 'Mirtha Legrand',
  titulo: 'Diva de la Televisión Argentina',
  ubicacion: 'Buenos Aires, Argentina',
  pieza: 'Aderezo «Gran Gala» · Esmeraldas',
  cita: 'Siempre dije que como te ven, te tratan. Con una pieza de Aura, una entra a cualquier salón ya vestida de luz.',
};

const EMBAJADORES = [
  {
    nombre: 'Lionel Messi',
    titulo: 'Ícono Deportivo',
    ubicacion: 'Rosario, Argentina',
    pieza: 'Sello «Eterno» · Oro 18k',
    cita: 'Buscaba algo que no gritara, que simplemente estuviera ahí, como las cosas que de verdad importan. La pieza de Aura tiene esa serenidad.',
    foto: '/embajadores/messi.jpg',
  },
  {
    nombre: 'Tini Stoessel',
    titulo: 'Cantante & Compositora',
    ubicacion: 'Buenos Aires, Argentina',
    pieza: 'Collar «Aurora» · Diamantes',
    cita: 'Subo a un escenario para miles de personas, pero la joya de Aura la elijo para mí. Es mi pequeño secreto de luz.',
    foto: '/embajadores/tini.jpg',
  },
  {
    nombre: 'Ricardo Darín',
    titulo: 'Actor',
    ubicacion: 'Buenos Aires, Argentina',
    pieza: 'Gemelos «Monserrat» · Platino',
    cita: 'A cierta edad uno valora lo que perdura. Aura entiende que la elegancia no es ruido: es permanencia.',
    foto: '/embajadores/darin.jpg',
  },
  {
    nombre: 'Ricardo Fort',
    titulo: 'Empresario & Mediático',
    ubicacion: 'Buenos Aires, Argentina',
    pieza: 'Cadena «Comandante» · Oro 18k y diamantes',
    cita: 'Tuve todo lo que el dinero puede comprar. Aura es de lo poco que todavía logra sorprenderme: lujo de verdad, sin pedir permiso.',
    foto: '/embajadores/fort.jpg',
  },
  {
    nombre: 'Úrsula Corberó',
    titulo: 'Actriz',
    ubicacion: 'Barcelona, España',
    pieza: 'Aros «Cascada» · Diamantes',
    cita: 'Me probé docenas de piezas para la alfombra roja. Solo una se sintió como piel propia: la de Aura.',
    foto: '/embajadores/ursula.jpg',
  },
  {
    nombre: 'Zendaya',
    titulo: 'Actriz & Ícono de Moda',
    ubicacion: 'California, EE. UU.',
    pieza: 'Pulsera «Manifiesto» · Oro blanco',
    cita: 'Una joya debería sentirse como armadura y poesía a la vez. Aura encontró ese equilibrio exacto.',
    foto: '/embajadores/zendaya.jpg',
  },
  {
    nombre: 'Roger Federer',
    titulo: 'Leyenda del Tenis',
    ubicacion: 'Basilea, Suiza',
    pieza: 'Reloj-joya «Mérito» · Platino',
    cita: 'La precisión es un arte silencioso. Reconocí en Aura la misma obsesión por el detalle perfecto.',
    foto: '/embajadores/federer.jpg',
  },
];

// Duración de cada slide en autoplay (el de video dura más para poder verlo completo)
const DURACION_VIDEO = 18000;
const DURACION_SLIDE = 6500;

function Embajadores() {
  // Slide 0 = video de campaña + Mirtha. Slides 1..N = testimonios.
  const total = EMBAJADORES.length + 1;
  const [actual, setActual] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [pausado, setPausado] = useState(false);

  const irA = useCallback((i) => setActual(((i % total) + total) % total), [total]);
  const siguiente = useCallback(() => setActual((p) => (p + 1) % total), [total]);
  const anterior = useCallback(() => setActual((p) => (p - 1 + total) % total), [total]);

  // Autoplay
  useEffect(() => {
    if (!autoplay || pausado) return;
    const duracion = actual === 0 ? DURACION_VIDEO : DURACION_SLIDE;
    const t = setTimeout(siguiente, duracion);
    return () => clearTimeout(t);
  }, [actual, autoplay, pausado, siguiente]);

  // Navegación por teclado
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') siguiente();
      else if (e.key === 'ArrowLeft') anterior();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [siguiente, anterior]);

  const contador = String(actual + 1).padStart(2, '0');
  const totalStr = String(total).padStart(2, '0');

  return (
    <div className="min-h-screen bg-background text-on-surface pt-32 pb-section-gap overflow-hidden">
      <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">

        {/* Encabezado */}
        <div className="text-center mb-12 md:mb-16">
          <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase block mb-3 text-xs">
            El Círculo Aura
          </span>
          <h1 className="font-display-lg text-4xl md:text-6xl text-on-surface font-light leading-tight">
            Quienes Eligen Aura
          </h1>
          <div className="w-12 h-[1px] bg-primary mx-auto mt-6 mb-6"></div>
          <p className="font-body-lg text-secondary max-w-2xl mx-auto font-light text-sm md:text-base">
            Figuras del deporte, el cine y la música que han hecho de nuestras piezas
            una extensión de su propia historia.
          </p>
        </div>

        {/* Carrusel */}
        <div
          className="relative"
          onMouseEnter={() => setPausado(true)}
          onMouseLeave={() => setPausado(false)}
        >
          {/* Marca de agua decorativa */}
          <span className="hidden lg:block absolute -top-10 left-1/2 -translate-x-1/2 font-display-lg text-[160px] leading-none text-outline/[0.04] select-none pointer-events-none z-0">
            AURA
          </span>

          {/* Pista deslizante */}
          <div className="overflow-hidden relative z-10">
            <div
              className="flex items-stretch"
              style={{
                transform: `translateX(-${actual * 100}%)`,
                transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* SLIDE 0 — Video de campaña + testimonio de Mirtha */}
              <SlideVideo activo={actual === 0} persona={MIRTHA} />

              {/* SLIDES 1..N — Testimonios */}
              {EMBAJADORES.map((emb) => (
                <SlideTestimonio key={emb.nombre} emb={emb} />
              ))}
            </div>
          </div>

          {/* Flechas de navegación */}
          <button
            onClick={anterior}
            aria-label="Anterior"
            className="absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-outline-variant/20 text-on-surface hover:text-primary hover:border-primary/50 transition-all duration-300 cursor-pointer luxury-shadow"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            onClick={siguiente}
            aria-label="Siguiente"
            className="absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-outline-variant/20 text-on-surface hover:text-primary hover:border-primary/50 transition-all duration-300 cursor-pointer luxury-shadow"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

        {/* Controles inferiores: contador · dots · play/pausa */}
        <div className="flex items-center justify-center gap-6 mt-10">
          <span className="font-label-caps text-label-caps text-on-surface-variant tracking-widest tabular-nums text-xs">
            {contador}
            <span className="text-outline/40"> / {totalStr}</span>
          </span>

          <div className="flex items-center gap-2.5">
            {Array.from({ length: total }).map((_, i) => (
              <button
                key={i}
                onClick={() => irA(i)}
                aria-label={i === 0 ? 'Ir al video' : `Ir al testimonio ${i}`}
                className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                  actual === i
                    ? 'w-8 bg-primary'
                    : 'w-1.5 bg-outline-variant/40 hover:bg-outline-variant'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setAutoplay((a) => !a)}
            aria-label={autoplay ? 'Pausar' : 'Reproducir'}
            className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors text-xl bg-transparent border-0 cursor-pointer flex items-center"
          >
            {autoplay ? 'pause_circle' : 'play_circle'}
          </button>
        </div>

        {/* Aviso académico (testimonios ficticios) */}
        <p className="font-body-md text-[11px] text-outline/70 text-center max-w-2xl mx-auto mt-16 leading-relaxed font-light italic">
          * Las personas mencionadas son reales, pero los testimonios, las piezas y su
          asociación con la marca son ficticios. Contenido creado con fines exclusivamente
          académicos para el Trabajo Práctico Obligatorio (TPO) de la UADE.
        </p>
      </div>
    </div>
  );
}

/* ── Slide 0: video de campaña (grande) + testimonio de Mirtha ────────────── */
function SlideVideo({ activo, persona }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (activo) {
      const p = v.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    } else {
      v.pause();
    }
  }, [activo]);

  return (
    <div className="w-full flex-shrink-0 flex items-center justify-center px-1">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-14 items-center w-full max-w-6xl">

        {/* Video de campaña — protagonista (3/5 del ancho en desktop) */}
        <div className="md:col-span-3 relative w-full max-w-[640px] mx-auto aspect-square overflow-hidden rounded-xl border border-outline-variant/15 luxury-shadow">
          <video
            ref={videoRef}
            src="/aura-embajadores.mp4"
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            controls
          />
          <span className="absolute top-4 left-4 font-label-caps text-[10px] tracking-widest uppercase bg-background/80 backdrop-blur-sm text-primary px-3 py-1.5 rounded-full border border-outline-variant/20 pointer-events-none">
            Campaña Aura
          </span>
        </div>

        {/* Testimonio de Mirtha Legrand (2/5 del ancho) */}
        <div className="md:col-span-2 text-center md:text-left">
          <span className="font-display-lg text-7xl text-primary/20 leading-none block mb-2 select-none">
            &ldquo;
          </span>
          <blockquote className="font-display-lg text-2xl md:text-[26px] text-on-surface font-light leading-snug mb-8">
            {persona.cita}
          </blockquote>

          <div className="w-10 h-[1px] bg-primary mb-5 mx-auto md:mx-0"></div>

          <p className="font-headline-md text-headline-md text-on-surface mb-1">
            {persona.nombre}
          </p>
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-xs mb-4">
            {persona.titulo} · {persona.ubicacion}
          </p>
          <p className="font-label-caps text-[11px] text-primary tracking-wider uppercase inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">diamond</span>
            {persona.pieza}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Slide de testimonio de un embajador ──────────────────────────────────── */
function SlideTestimonio({ emb }) {
  return (
    <div className="w-full flex-shrink-0 flex items-center justify-center px-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center w-full max-w-4xl">

        {/* Retrato */}
        <div className="image-container relative aspect-[4/5] max-w-sm mx-auto md:mx-0 w-full overflow-hidden rounded-xl border border-outline-variant/15 bg-surface-container-low luxury-shadow">
          {emb.foto ? (
            <img
              src={emb.foto}
              alt={emb.nombre}
              className="image-zoom-hover w-full h-full object-cover grayscale hover:grayscale-0 select-none"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-outline/60">
              <span className="material-symbols-outlined text-5xl font-light">add_a_photo</span>
              <span className="font-label-caps text-[10px] tracking-widest uppercase text-center px-4">
                Foto de<br />{emb.nombre}
              </span>
            </div>
          )}
        </div>

        {/* Cita y datos */}
        <div className="text-center md:text-left">
          <span className="font-display-lg text-7xl text-primary/20 leading-none block mb-2 select-none">
            &ldquo;
          </span>
          <blockquote className="font-display-lg text-2xl md:text-[28px] text-on-surface font-light leading-snug mb-8">
            {emb.cita}
          </blockquote>

          <div className="w-10 h-[1px] bg-primary mb-5 mx-auto md:mx-0"></div>

          <p className="font-headline-md text-headline-md text-on-surface mb-1">
            {emb.nombre}
          </p>
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-xs mb-4">
            {emb.titulo} · {emb.ubicacion}
          </p>
          <p className="font-label-caps text-[11px] text-primary tracking-wider uppercase inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">diamond</span>
            {emb.pieza}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Embajadores;
