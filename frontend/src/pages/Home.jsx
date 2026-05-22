import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const [mostrarModalNewsletter, setMostrarModalNewsletter] = useState(false);
  const [emailNewsletter, setEmailNewsletter] = useState('');

  // Función para navegar al catálogo con una categoría específica seleccionada
  const verCategoria = (idCategoria) => {
    navigate(`/productos?categoria=${idCategoria}`);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    setMostrarModalNewsletter(true);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover select-none animate-scale-up"
            src="/hero_bracelet.png"
            alt="Aura Fine Jewelry Hero"
          />
          <div className="absolute inset-0 bg-black/15"></div>
        </div>
        <div className="relative z-10 max-w-container-max mx-auto px-6 md:px-margin-desktop w-full text-white">
          <div className="max-w-2xl animate-fade-in">
            <span className="font-label-caps text-label-caps text-primary-fixed mb-4 block tracking-widest uppercase text-xs">
              Nueva Colección de Temporada
            </span>
            <h1 className="font-display-lg text-5xl md:text-7xl mb-8 leading-tight font-light">
              Luz Etérea, <br />Forma Eterna.
            </h1>
            <button
              onClick={() => navigate('/productos')}
              className="inline-block px-10 py-5 bg-white text-on-surface font-label-caps text-label-caps hover:bg-primary hover:text-white transition-all duration-500 tracking-widest uppercase border border-transparent text-xs font-semibold cursor-pointer rounded-sm"
            >
              Descubrir Colección
            </button>
          </div>
        </div>
      </section>

      {/* Featured Collections (Bento Style) */}
      <section id="collections" className="py-section-gap max-w-container-max mx-auto px-6 md:px-margin-desktop scroll-mt-24">
        <div className="text-center mb-20">
          <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase block mb-3 text-xs">
            La Curaduría
          </span>
          <h2 className="font-display-lg text-4xl md:text-5xl text-on-surface font-light">Colecciones Esenciales</h2>
          <div className="w-12 h-[1px] bg-primary mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Rings */}
          <div 
            onClick={() => verCategoria(1)} // ID 1 = Anillos en import.sql
            className="md:col-span-8 group overflow-hidden relative image-container border border-outline-variant/10 cursor-pointer h-[500px] md:h-[600px] rounded-lg"
          >
            <img
              className="w-full h-full object-cover image-zoom-hover select-none"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXqU8StEwhr6lJQWX09Rf7_PQ1NtVtg7Jh9qmS8susA5iaNIZsiIvoCwyMs8xvnvcGKYih7xun_aIAOZJbJCJQy-zWNrLoTItnxx4OnxbEIcvZW3vfNgbpNI9_fFEBOTWBXlSnEZ9P7KflI87OlHuZChH0k7unwRDUoeUeiVp_G2wRCF_rw2xVLQHfWj4hQriUdmpr6DzRfP5npWi2_EoQdgFQ4Q7f60QjOMaW6d4rLcEVYadt0L2yP7AJ-nvU8HNuxMBURZtgvhs"
              alt="Colección de Anillos"
            />
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-500"></div>
            <div className="absolute bottom-10 left-10">
              <h3 className="font-display-lg text-3xl md:text-4xl text-primary mb-2">Anillos</h3>
              <span className="font-label-caps text-label-caps text-primary border-b border-primary/30 pb-1 group-hover:border-primary transition-colors duration-300 text-xs tracking-wider">
                Comprar Colección
              </span>
            </div>
          </div>

          {/* Right column: Earrings & Necklaces */}
          <div className="md:col-span-4 flex flex-col gap-gutter">
            {/* Earrings */}
            <div 
              onClick={() => verCategoria(4)} // ID 4 = Aros/Earrings en import.sql
              className="h-[288px] md:h-[288px] group overflow-hidden relative image-container border border-outline-variant/10 cursor-pointer rounded-lg"
            >
              <img
                className="w-full h-full object-cover image-zoom-hover select-none"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCswhrQ7l7L2JtTVL9BoIJ5E-W8sTX4X1K2dGExCM4bCC3jlJqMcL9ndxLdeh48kLgnT4zM9iHyAKbsT54GU9lXf_VBPz9c6SBfWogVMTCdRCM2DEYo8p7uc-hwYJOh-6L27PZ1MlgjNjaprc8zLWEQOjmThqJm4gvBR8B1gfI2olOgSopU__fBpT39r67y1Z83_sUjR5XpENMiif8ujJWzoAWNmvRu6EKRbn1MCF5XBJXRqCzIviim7YtbRqygwazthEhQtMYvrtE"
                alt="Colección de Aros"
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-500"></div>
              <div className="absolute bottom-8 left-8">
                <h3 className="font-display-lg text-2xl text-primary mb-1">Aros</h3>
                <span className="font-label-caps text-label-caps text-primary/90 group-hover:text-primary transition-colors duration-300 text-xs tracking-wider">
                  Explorar
                </span>
              </div>
            </div>

            {/* Necklaces */}
            <div 
              onClick={() => verCategoria(2)} // ID 2 = Collares en import.sql
              className="h-[288px] md:h-[288px] group overflow-hidden relative image-container border border-outline-variant/10 cursor-pointer rounded-lg"
            >
              <img
                className="w-full h-full object-cover image-zoom-hover select-none"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJ0g8bjlEYNg2hOVjMymQzIVzRu26qT8go9XwGVBBK5PBspTCtxO7CNuZ6iBY9ZalFq-ohWRrbhPVsXRE9nktWzxqTSp6NWmJODp8xiRYUSaRijTZCq_T2hcHkqQwgzo9qidAje7GIj1qqID6lLwd_GBTjRlthUDagnGwTu5Y1WGpMT_wI1ocRvLQZlAxNzf43c6_nulCkEaKE3fLT5rfOesEbGBS6dCWOgxyqSErRiq-ULq-bTZ1HPRC7r9ImezLjmH2TT0c6Qmg"
                alt="Colección de Collares"
              />
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-500"></div>
              <div className="absolute bottom-8 left-8">
                <h3 className="font-display-lg text-2xl text-primary mb-1">Collares</h3>
                <span className="font-label-caps text-label-caps text-primary/90 group-hover:text-primary transition-colors duration-300 text-xs tracking-wider">
                  Explorar
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Craftsmanship Section */}
      <section className="py-section-gap bg-surface-container-low overflow-hidden">
        <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          <div className="w-full md:w-1/2">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
              <img
                className="relative z-10 w-full grayscale contrast-125 ambient-shadow border border-white/20 rounded-lg select-none"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuADKa9h_aHbjagV89hae4PYWA6Xq6zFvrBuyi4PC64wp7nX-Sha9aGU22cwSpUFB7j98bc5Uhhx2bF0WR40siw-v2UfYCLdQ52KDp_FkkSZfAtX87pMpKa9v3_8cMcNeM2s90DzGIqQm3ujzZwfuElev4VmPhnhcbZsfvLIjdd0d20Bq_Vjw2BkH_wWyHw_XZIohYnhnrPBM7RKEYqLvcgrIU-PoLBJ53MnCqcjDnZhwLIU4juE6mjkcSyziunqdPDeTakygWvmATE"
                alt="Maestro joyero trabajando"
              />
            </div>
          </div>
          <div className="w-full md:w-1/2 space-y-8">
            <span className="font-label-caps text-label-caps text-primary block tracking-widest uppercase text-xs">
              El Atelier Digital
            </span>
            <h2 className="font-display-lg text-4xl md:text-5xl text-on-surface leading-tight italic font-light">
              Precisión en cada faceta, alma en cada pieza.
            </h2>
            <p className="font-body-lg text-body-lg text-secondary max-w-lg leading-relaxed font-light">
              En Aura, creemos que la joyería es más que un accesorio; es una narrativa de herencia personal. Cada pieza es meticulosamente elaborada a mano en nuestro taller utilizando piedras de origen ético y metales preciosos recuperados, garantizando un legado tan sostenible como hermoso.
            </p>
            <div className="pt-4">
              <button
                onClick={() => navigate('/about')}
                className="font-label-caps text-label-caps text-on-surface border-b-2 border-primary pb-2 hover:text-primary transition-all duration-300 uppercase tracking-widest text-xs font-semibold cursor-pointer"
              >
                Nuestra Historia
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-section-gap text-center max-w-container-max mx-auto px-6 md:px-margin-desktop">
        <div className="max-w-2xl mx-auto space-y-8">
          <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase block text-xs">
            Boletín Informativo
          </span>
          <h2 className="font-display-lg text-4xl md:text-5xl text-on-surface font-light">Mantente en la Luz</h2>
          <p className="font-body-md text-body-md text-secondary leading-relaxed font-light">
            Únete al círculo de Aura para obtener acceso exclusivo a presentaciones privadas y lanzamientos de temporada.
          </p>
          <form 
            onSubmit={handleNewsletterSubmit} 
            className="flex flex-col sm:flex-row gap-4 items-end pt-4"
          >
            <div className="flex-grow w-full">
              <input
                className="w-full bg-transparent border-0 border-b border-outline py-4 px-0 focus:ring-0 focus:border-primary placeholder:text-outline/40 font-body-md text-on-surface"
                placeholder="Tu dirección de correo electrónico"
                type="email"
                required
                value={emailNewsletter}
                onChange={(e) => setEmailNewsletter(e.target.value)}
              />
            </div>
            <button
              className="font-label-caps text-label-caps bg-on-surface text-background px-8 py-4 w-full sm:w-auto hover:bg-primary hover:text-white transition-colors uppercase tracking-widest border border-transparent text-xs font-semibold cursor-pointer rounded-sm"
              type="submit"
            >
              Suscribirse
            </button>
          </form>
        </div>
      </section>

      {/* Modal de éxito de suscripción */}
      {mostrarModalNewsletter && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-outline-variant/20 max-w-md w-full p-8 text-center rounded-xl luxury-shadow space-y-6 animate-scale-up">
            <div className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto text-3xl font-light">
              ◇
            </div>
            
            <div className="space-y-2">
              <h2 className="font-display-lg text-2xl text-on-surface font-light">¡Bienvenido al Círculo!</h2>
              <p className="font-body-md text-secondary leading-relaxed text-sm font-light">
                Hemos registrado tu correo <strong className="text-on-surface font-medium">{emailNewsletter}</strong> en nuestro boletín exclusivo de Aura. Pronto recibirás novedades y accesos preferenciales.
              </p>
            </div>

            <button
              onClick={() => {
                setMostrarModalNewsletter(false);
                setEmailNewsletter('');
              }}
              className="w-full py-4 bg-on-surface text-background font-label-caps text-label-caps hover:bg-primary transition-all duration-300 uppercase tracking-widest text-xs font-semibold cursor-pointer rounded-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
