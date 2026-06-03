import { useState } from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const [modalPolitica, setModalPolitica] = useState(null); // 'envios', 'privacidad', 'terminos', 'cuidado' o null
  const [toastRedes, setToastRedes] = useState('');

  const abrirPolitica = (clave) => {
    setModalPolitica(clave);
  };

  const handleRedesClick = (red) => {
    setToastRedes(`Conectando con el canal de ${red} oficial de Aura...`);
    setTimeout(() => setToastRedes(''), 3000);
  };

  const obtenerContenidoPolitica = () => {
    switch (modalPolitica) {
      case 'envios':
        return {
          titulo: 'Envíos y Devoluciones',
          cuerpo: 'En Aura | Fine Jewelry, ofrecemos envíos internacionales asegurados de cortesía para todas nuestras piezas exclusivas. Cada pedido se procesa y despacha en un plazo de 48 horas en un embalaje premium diseñado para proteger la joya. Las devoluciones o cambios se pueden solicitar dentro de los 14 días posteriores a la recepción del producto, siempre que la pieza se conserve en su estado original y con todos los empaques de marca intactos.',
        };
      case 'privacidad':
        return {
          titulo: 'Política de Privacidad',
          cuerpo: 'Nos tomamos muy en serio la seguridad y confidencialidad de su información personal. Toda la información recopilada a través del registro o durante la compra se procesa mediante pasarelas seguras y encriptadas (SSL). Aura nunca venderá ni cederá sus datos a terceros. Los datos recabados se utilizan únicamente para procesar su compra, contactarle sobre su pedido o enviarle invitaciones exclusivas de nuestro Atelier.',
        };
      case 'terminos':
        return {
          titulo: 'Términos de Servicio',
          cuerpo: 'El uso del sitio web de Aura y la compra de nuestras piezas están sujetos a nuestros términos de servicio. Debido a la naturaleza artesanal de nuestras joyas de lujo, todas las piezas están sujetas a disponibilidad de stock. Los precios indicados en dólares estadounidenses (USD) están sujetos a cambios y pueden no incluir tasas aduaneras locales específicas de cada país de entrega.',
        };
      case 'cuidado':
        return {
          titulo: 'Guía de Cuidado',
          cuerpo: 'Nuestras piezas de alta joyería están diseñadas para durar generaciones si se cuidan adecuadamente. Recomendamos evitar el contacto directo con perfumes, lociones, agua salada o productos químicos de limpieza. Guarde siempre sus joyas en el estuche o bolsa de gamuza provistos por Aura para evitar rayaduras. Para la limpieza rutinaria, utilice un paño de microfibra suave y seco, evitando abrasivos.',
        };
      default:
        return { titulo: '', cuerpo: '' };
    }
  };

  const contenido = obtenerContenidoPolitica();

  return (
    <footer className="bg-background text-on-surface border-t border-outline-variant/20 py-16 mt-auto">
      <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Col */}
          <div className="space-y-4">
            <span className="font-headline-lg text-headline-lg tracking-tighter text-on-background">
              Aura
            </span>
            <p className="font-body-md text-secondary text-sm leading-relaxed max-w-xs font-light">
              Joyería atemporal diseñada para el coleccionista moderno. Creada con precisión, llevada con propósito. Curando una belleza singular a través del diseño atemporal y el oficio ético.
            </p>
          </div>

          {/* Navigation Col */}
          <div className="space-y-4">
            <h4 className="font-label-caps text-label-caps text-on-surface tracking-widest uppercase text-xs font-semibold">
              Navegación
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="font-body-md text-secondary hover:text-primary text-sm transition-colors duration-250 font-light">
                  Colecciones
                </Link>
              </li>
              <li>
                <Link to="/productos" className="font-body-md text-secondary hover:text-primary text-sm transition-colors duration-250 font-light">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link to="/about" className="font-body-md text-secondary hover:text-primary text-sm transition-colors duration-250 font-light">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link to="/about#contact" className="font-body-md text-secondary hover:text-primary text-sm transition-colors duration-250 font-light">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Service/Support Col */}
          <div className="space-y-4">
            <h4 className="font-label-caps text-label-caps text-on-surface tracking-widest uppercase text-xs font-semibold">
              Servicios
            </h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => abrirPolitica('envios')}
                  className="font-body-md text-secondary hover:text-primary text-sm transition-colors duration-250 text-left cursor-pointer bg-transparent border-0 p-0 font-light"
                >
                  Envíos y Devoluciones
                </button>
              </li>
              <li>
                <button 
                  onClick={() => abrirPolitica('privacidad')}
                  className="font-body-md text-secondary hover:text-primary text-sm transition-colors duration-250 text-left cursor-pointer bg-transparent border-0 p-0 font-light"
                >
                  Política de Privacidad
                </button>
              </li>
              <li>
                <button 
                  onClick={() => abrirPolitica('terminos')}
                  className="font-body-md text-secondary hover:text-primary text-sm transition-colors duration-250 text-left cursor-pointer bg-transparent border-0 p-0 font-light"
                >
                  Términos de Servicio
                </button>
              </li>
              <li>
                <button 
                  onClick={() => abrirPolitica('cuidado')}
                  className="font-body-md text-secondary hover:text-primary text-sm transition-colors duration-250 text-left cursor-pointer bg-transparent border-0 p-0 font-light"
                >
                  Guía de Cuidado
                </button>
              </li>
            </ul>
          </div>

          {/* Connect Col */}
          <div className="space-y-4">
            <h4 className="font-label-caps text-label-caps text-on-surface tracking-widest uppercase text-xs font-semibold">
              Conexión
            </h4>
            <div className="flex gap-4">
              <span
                onClick={() => handleRedesClick('Instagram')}
                className="material-symbols-outlined text-secondary hover:text-primary cursor-pointer transition-colors duration-250 text-xl"
              >
                public
              </span>
              <span
                onClick={() => handleRedesClick('Pinterest')}
                className="material-symbols-outlined text-secondary hover:text-primary cursor-pointer transition-colors duration-250 text-xl"
              >
                share
              </span>
              <a
                href="mailto:grupo11@uade.edu.ar"
                className="material-symbols-outlined text-secondary hover:text-primary cursor-pointer transition-colors duration-250 text-xl"
              >
                mail
              </a>
            </div>
            <p className="font-body-md text-secondary text-xs pt-2 font-light">
              Basados en La campeona del Mundo (2022), envíos a todo el mundo.
            </p>
          </div>
        </div>

        {/* Bottom copyright and legal */}
        <div className="border-t border-outline-variant/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-body-md text-outline">
          <span>&copy; {new Date().getFullYear()} Aura Fine Jewelry. Todos los derechos reservados.</span>
          <div className="flex gap-6">
            <button 
              onClick={() => abrirPolitica('privacidad')}
              className="hover:text-primary cursor-pointer transition-colors duration-250 bg-transparent border-0 text-xs text-outline"
            >
              Política de Privacidad
            </button>
            <button 
              onClick={() => abrirPolitica('terminos')}
              className="hover:text-primary cursor-pointer transition-colors duration-250 bg-transparent border-0 text-xs text-outline"
            >
              Términos de Servicio
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Políticas de Marca */}
      {modalPolitica && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-outline-variant/20 max-w-lg w-full p-8 rounded-xl luxury-shadow space-y-6 animate-scale-up">
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
              <h2 className="font-display-lg text-2xl text-on-surface font-light">
                {contenido.titulo}
              </h2>
              <button 
                onClick={() => setModalPolitica(null)}
                className="material-symbols-outlined text-secondary hover:text-primary bg-transparent border-0 cursor-pointer text-xl"
              >
                close
              </button>
            </div>
            
            <p className="font-body-md text-secondary leading-relaxed text-sm font-light whitespace-pre-line">
              {contenido.cuerpo}
            </p>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setModalPolitica(null)}
                className="px-8 py-3 bg-on-surface text-background font-label-caps text-label-caps hover:bg-primary transition-all duration-300 uppercase tracking-widest text-xs font-semibold cursor-pointer rounded-sm"
              >
                Cerrar
              </button>
            </div>
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
    </footer>
  );
}

export default Footer;
