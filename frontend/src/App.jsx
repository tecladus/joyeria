import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import RutaProtegida from './components/RutaProtegida';
import ScrollToTop from './components/ScrollToTop';
import { ModalProvider } from './components/ModalContext';
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Productos from './pages/Productos';
import DetalleProducto from './pages/DetalleProducto';
import Carrito from './pages/Carrito';
import PanelVendedor from './pages/PanelVendedor';
import HistorialCompras from './pages/HistorialCompras';
import PanelAdmin from './pages/PanelAdmin';
import PanelModerador from './pages/PanelModerador';
import { fetchPerfil } from './redux/slices/authSlice';
import { fetchCarrito } from './redux/slices/carritoSlice';
import Favoritos from './pages/Favoritos';
import CheckoutResultado from './pages/CheckoutResultado';
import Prode from './pages/Prode';

function App() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const theme = useSelector((state) => state.theme.theme);

  // Sincronizar el tema seleccionado con la clase del documento DOM
  useEffect(() => {
    const root = window.document.documentElement;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    const aplicarTema = () => {
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && systemPrefersDark.matches);

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    aplicarTema();

    if (theme === 'system') {
      const listener = (e) => {
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };
      systemPrefersDark.addEventListener('change', listener);
      return () => systemPrefersDark.removeEventListener('change', listener);
    }
  }, [theme]);

  // Al montar y cuando cambia el auth, carga el carrito si está autenticado
  useEffect(() => {
    if (auth.token && auth.idUsuario) {
      dispatch(fetchCarrito(auth.idUsuario));
    }
  }, [auth.token, auth.idUsuario, dispatch]);

  // Cargar perfil completo si está autenticado pero faltan datos locales (nombre)
  useEffect(() => {
    if (auth.token && !auth.nombre) {
      dispatch(fetchPerfil());
    }
  }, [auth.token, auth.nombre, dispatch]);

  return (
    <ModalProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-background">
          <NavBar />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/productos" element={<Productos />} />
              <Route path="/productos/:id" element={<DetalleProducto />} />
              <Route path="/prode" element={<Prode />} />
              <Route
                path="/favoritos"
                element={
                  <RutaProtegida>
                    <Favoritos />
                  </RutaProtegida>
                }
              />
              <Route
                path="/carrito"
                element={
                  <RutaProtegida>
                    <Carrito />
                  </RutaProtegida>
                }
              />
              <Route
                path="/checkout/resultado"
                element={
                  <RutaProtegida>
                    <CheckoutResultado />
                  </RutaProtegida>
                }
              />
              <Route
                path="/vendedor"
                element={
                  <RutaProtegida rolRequerido={['VENDEDOR', 'ADMIN', 'MODERATOR']}>
                    <PanelVendedor />
                  </RutaProtegida>
                }
              />
              <Route
                path="/compras"
                element={
                  <RutaProtegida>
                    <HistorialCompras />
                  </RutaProtegida>
                }
              />
              <Route
                path="/admin"
                element={
                  <RutaProtegida rolRequerido="ADMIN">
                    <PanelAdmin />
                  </RutaProtegida>
                }
              />
              <Route
                path="/moderador"
                element={
                  <RutaProtegida rolRequerido="MODERATOR">
                    <PanelModerador />
                  </RutaProtegida>
                }
              />
              {/* Ruta comodín: redirige a la página de inicio */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </ModalProvider>
  );
}

export default App;
