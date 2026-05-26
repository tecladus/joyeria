import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { convertirseEnVendedor } from '../services/api';

function NavBar({ auth, onCerrarSesion, cantidadCarrito, onActualizarAuth }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const dropdownRef = useRef(null);

  const estaLogueado = !!auth.token;
  const esVendedor = auth.rol === 'VENDEDOR';
  const esComprador = auth.rol === 'COMPRADOR';
  const esAdmin = auth.rol === 'ADMIN';
  const esModerador = auth.rol === 'MODERATOR';

  const handleCerrarSesion = () => {
    onCerrarSesion();
    setMenuMovilAbierto(false);
    setDropdownAbierto(false);
    navigate('/login');
  };

  const handleConvertirseEnVendedor = async () => {
    if (!window.confirm('¿Desea convertir su cuenta en una cuenta de Vendedor para publicar y gestionar sus propias joyas?')) return;
    try {
      const datos = await convertirseEnVendedor();
      onActualizarAuth(datos);
      setDropdownAbierto(false);
      setMenuMovilAbierto(false);
      navigate('/vendedor');
    } catch (err) {
      alert(err.message || 'Error al convertir la cuenta.');
    }
  };

  const linkActivo = (path) => location.pathname === path;

  const handleNavClick = (e, path, hashId) => {
    if (location.pathname === path) {
      e.preventDefault();
      const element = document.getElementById(hashId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMenuMovilAbierto(false);
  };

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant/10 h-20 flex items-center">
      <nav className="max-w-container-max mx-auto px-6 md:px-margin-desktop flex justify-between items-center w-full">
        {/* Enlaces de navegación izquierda (Desktop) */}
        <div className="flex-1 hidden md:flex items-center gap-8">
          <Link
            to="/#collections"
            onClick={(e) => handleNavClick(e, '/', 'collections')}
            className={`font-label-caps text-label-caps tracking-wider transition-colors duration-300 pb-1 ${
              linkActivo('/') && location.hash === '#collections'
                ? 'text-primary border-b border-primary'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Colecciones
          </Link>
          <Link
            to="/productos"
            className={`font-label-caps text-label-caps tracking-wider transition-colors duration-300 pb-1 ${
              linkActivo('/productos')
                ? 'text-primary border-b border-primary'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Catálogo
          </Link>
          <Link
            to="/about"
            className={`font-label-caps text-label-caps tracking-wider transition-colors duration-300 pb-1 ${
              linkActivo('/about') && !location.hash
                ? 'text-primary border-b border-primary'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Nosotros
          </Link>
          <Link
            to="/about#contact"
            onClick={(e) => handleNavClick(e, '/about', 'contact')}
            className={`font-label-caps text-label-caps tracking-wider transition-colors duration-300 pb-1 ${
              linkActivo('/about') && location.hash === '#contact'
                ? 'text-primary border-b border-primary'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Contacto
          </Link>
        </div>

        {/* Logo Central */}
        <Link
          to="/"
          className="font-headline-lg text-headline-lg tracking-tighter text-on-background text-center flex-none"
        >
          Aura
        </Link>

        {/* Enlaces de navegación derecha (Desktop) */}
        <div className="flex-1 flex justify-end items-center gap-6">
          <div className="hidden md:flex items-center gap-6 relative" ref={dropdownRef}>
            {/* Buscador de Escritorio */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const query = e.target.search.value;
                navigate(`/productos?search=${encodeURIComponent(query)}`);
              }} 
              className="relative flex items-center bg-surface-container-low/60 border border-outline-variant/10 rounded px-2.5 py-1 focus-within:border-primary/55 transition-all duration-300 mr-2"
            >
              <input
                type="text"
                name="search"
                placeholder="Buscar..."
                className="bg-transparent border-0 outline-none text-xs w-24 md:w-32 focus:w-40 transition-all duration-500 text-on-surface font-body-md placeholder:text-outline/45"
              />
              <button 
                type="submit" 
                className="material-symbols-outlined text-outline hover:text-primary transition-colors text-lg flex items-center justify-center p-0 bg-transparent border-0 cursor-pointer"
              >
                search
              </button>
            </form>

            {/* Icono de Usuario (Perfil/Acciones) */}
            <div className="relative">
              <button
                onClick={() => setDropdownAbierto(!dropdownAbierto)}
                className="material-symbols-outlined text-on-surface hover:text-primary transition-colors duration-300 text-2xl flex items-center justify-center cursor-pointer bg-transparent border-0"
                title="Mi Cuenta"
              >
                person
              </button>

              {/* Dropdown flotante premium */}
              {dropdownAbierto && (
                <div className="absolute right-0 mt-3 w-56 bg-background border border-outline-variant/20 rounded shadow-2xl py-4 z-50 animate-fade-in">
                  {!estaLogueado ? (
                    <div className="flex flex-col px-4 py-2 gap-2">
                      <Link
                        to="/login"
                        onClick={() => setDropdownAbierto(false)}
                        className="font-label-caps text-label-caps text-center border border-outline py-2 text-on-surface-variant hover:bg-surface-container transition-colors duration-250"
                      >
                        Ingresar
                      </Link>
                      <Link
                        to="/registro"
                        onClick={() => setDropdownAbierto(false)}
                        className="font-label-caps text-label-caps text-center bg-on-surface text-background py-2 hover:bg-primary hover:text-white transition-colors duration-250"
                      >
                        Registrarse
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="px-4 py-2 border-b border-outline-variant/10 mb-2">
                        <span className="font-label-caps text-[10px] text-outline block uppercase tracking-widest">
                          Rol de Cuenta
                        </span>
                        <span className="font-body-md text-on-surface text-xs font-semibold block mt-0.5">
                          {auth.rol === 'VENDEDOR' ? 'Vendedor' : auth.rol === 'ADMIN' ? 'Administrador' : auth.rol === 'MODERATOR' ? 'Moderador' : 'Comprador'}
                        </span>
                      </div>

                      {esComprador && (
                        <button
                          onClick={handleConvertirseEnVendedor}
                          className="font-label-caps text-label-caps text-left px-4 py-2.5 text-xs text-primary hover:bg-primary/5 transition-colors duration-200 cursor-pointer w-full bg-transparent border-0 flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">storefront</span>
                          Ser Vendedor
                        </button>
                      )}
                      
                      {(esVendedor || esAdmin || esModerador) && (
                        <Link
                          to="/vendedor"
                          onClick={() => setDropdownAbierto(false)}
                          className="font-label-caps text-label-caps text-left px-4 py-2.5 text-xs text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors duration-200"
                        >
                          {esVendedor ? 'Panel Vendedor' : 'Publicar Joyas'}
                        </Link>
                      )}

                      {estaLogueado && (
                        <>
                          <Link
                            to="/carrito"
                            onClick={() => setDropdownAbierto(false)}
                            className="font-label-caps text-label-caps text-left px-4 py-2.5 text-xs text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors duration-200"
                          >
                            Bolsa de Compras
                          </Link>
                          <Link
                            to="/compras"
                            onClick={() => setDropdownAbierto(false)}
                            className="font-label-caps text-label-caps text-left px-4 py-2.5 text-xs text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors duration-200"
                          >
                            Mis Compras
                          </Link>
                        </>
                      )}

                      {esAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setDropdownAbierto(false)}
                          className="font-label-caps text-label-caps text-left px-4 py-2.5 text-xs text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors duration-200"
                        >
                          Panel Admin
                        </Link>
                      )}

                      {esModerador && (
                        <Link
                          to="/moderador"
                          onClick={() => setDropdownAbierto(false)}
                          className="font-label-caps text-label-caps text-left px-4 py-2.5 text-xs text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors duration-200"
                        >
                          Panel Moderador
                        </Link>
                      )}

                      <button
                        onClick={handleCerrarSesion}
                        className="font-label-caps text-label-caps text-left px-4 py-2.5 text-xs text-error hover:bg-error-container/10 transition-colors duration-200 cursor-pointer w-full bg-transparent border-0"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Icono de bolsa de compras directo */}
          <Link
            to="/carrito"
            className="relative material-symbols-outlined text-on-surface hover:text-primary transition-colors duration-300 text-2xl"
          >
            shopping_bag
            {cantidadCarrito > 0 && (
              <span className="absolute -top-1 -right-2 bg-on-surface text-background text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold font-label-caps">
                {cantidadCarrito}
              </span>
            )}
          </Link>

          {/* Botón de Menú Móvil */}
          <button
            onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
            className="md:hidden material-symbols-outlined text-on-surface hover:text-primary text-2xl bg-transparent border-0 cursor-pointer"
          >
            {menuMovilAbierto ? 'close' : 'menu'}
          </button>
        </div>
      </nav>

      {/* Menú Desplegable Móvil */}
      {menuMovilAbierto && (
        <div className="absolute top-20 left-0 w-full bg-background border-b border-outline-variant/10 py-6 px-6 flex flex-col gap-4 md:hidden z-40 transition-all duration-300 ambient-shadow">
          {/* Buscador Móvil */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const query = e.target.search.value;
              setMenuMovilAbierto(false);
              navigate(`/productos?search=${encodeURIComponent(query)}`);
            }} 
            className="relative flex items-center bg-surface-container-low/60 border border-outline-variant/10 rounded px-3 py-2 focus-within:border-primary/50 transition-all duration-300 mb-2"
          >
            <input
              type="text"
              name="search"
              placeholder="Buscar pieza..."
              className="bg-transparent border-0 outline-none text-sm w-full text-on-surface font-body-md placeholder:text-outline/40"
            />
            <button 
              type="submit" 
              className="material-symbols-outlined text-outline hover:text-primary transition-colors text-xl flex items-center justify-center p-0 bg-transparent border-0 cursor-pointer"
            >
              search
            </button>
          </form>
          <Link
            to="/#collections"
            onClick={(e) => handleNavClick(e, '/', 'collections')}
            className="font-label-caps text-label-caps text-on-surface-variant py-2 border-b border-outline-variant/5 text-left"
          >
            Colecciones
          </Link>
          <Link
            to="/productos"
            onClick={() => setMenuMovilAbierto(false)}
            className="font-label-caps text-label-caps text-on-surface-variant py-2 border-b border-outline-variant/5 text-left"
          >
            Catálogo
          </Link>
          <Link
            to="/about"
            onClick={() => setMenuMovilAbierto(false)}
            className="font-label-caps text-label-caps text-on-surface-variant py-2 border-b border-outline-variant/5 text-left"
          >
            Nosotros
          </Link>
          <Link
            to="/about#contact"
            onClick={(e) => handleNavClick(e, '/about', 'contact')}
            className="font-label-caps text-label-caps text-on-surface-variant py-2 border-b border-outline-variant/5 text-left"
          >
            Contacto
          </Link>
          
          {estaLogueado && (esVendedor || esAdmin || esModerador) && (
            <Link
              to="/vendedor"
              onClick={() => setMenuMovilAbierto(false)}
              className="font-label-caps text-label-caps text-on-surface-variant py-2 border-b border-outline-variant/5 text-left"
            >
              {esVendedor ? 'Panel Vendedor' : 'Publicar Joyas'}
            </Link>
          )}

          {estaLogueado && esComprador && (
            <button
              onClick={handleConvertirseEnVendedor}
              className="font-label-caps text-label-caps text-primary py-2 border-b border-outline-variant/5 text-left bg-transparent border-0 cursor-pointer flex items-center gap-1.5 w-full"
            >
              <span className="material-symbols-outlined text-sm">storefront</span>
              Ser Vendedor
            </button>
          )}

          {estaLogueado && (
            <>
              <Link
                to="/carrito"
                onClick={() => setMenuMovilAbierto(false)}
                className="font-label-caps text-label-caps text-on-surface-variant py-2 border-b border-outline-variant/5 flex justify-between items-center text-left"
              >
                <span>Bolsa de Compras</span>
                {cantidadCarrito > 0 && (
                  <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {cantidadCarrito}
                  </span>
                )}
              </Link>
              <Link
                to="/compras"
                onClick={() => setMenuMovilAbierto(false)}
                className="font-label-caps text-label-caps text-on-surface-variant py-2 border-b border-outline-variant/5 text-left"
              >
                Mis Compras
              </Link>
            </>
          )}
          {estaLogueado && esAdmin && (
            <Link
              to="/admin"
              onClick={() => setMenuMovilAbierto(false)}
              className="font-label-caps text-label-caps text-on-surface-variant py-2 border-b border-outline-variant/5 text-left"
            >
              Panel Admin
            </Link>
          )}
          {estaLogueado && esModerador && (
            <Link
              to="/moderador"
              onClick={() => setMenuMovilAbierto(false)}
              className="font-label-caps text-label-caps text-on-surface-variant py-2 border-b border-outline-variant/5 text-left"
            >
              Panel Moderador
            </Link>
          )}

          {!estaLogueado ? (
            <div className="flex flex-col gap-3 mt-2">
              <Link
                to="/login"
                onClick={() => setMenuMovilAbierto(false)}
                className="font-label-caps text-label-caps text-center border border-outline py-3 text-on-surface-variant"
              >
                Ingresar
              </Link>
              <Link
                to="/registro"
                onClick={() => setMenuMovilAbierto(false)}
                className="font-label-caps text-label-caps text-center bg-on-surface text-background py-3"
              >
                Registrarse
              </Link>
            </div>
          ) : (
            <button
              onClick={handleCerrarSesion}
              className="font-label-caps text-label-caps text-center text-error border border-error/20 py-3 mt-2 w-full bg-transparent"
            >
              Cerrar Sesión
            </button>
          )}
        </div>
      )}
    </header>
  );
}

export default NavBar;
