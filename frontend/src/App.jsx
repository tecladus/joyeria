import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import RutaProtegida from './components/RutaProtegida';
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
import { getCarrito } from './services/api';

function App() {
  // Estado de autenticación: sincronizado con localStorage
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    idUsuario: localStorage.getItem('idUsuario'),
    rol: localStorage.getItem('rol'),
  });

  // Contador de items en el carrito para el badge del NavBar
  const [cantidadCarrito, setCantidadCarrito] = useState(0);

  // Al montar y cuando cambia el auth, carga la cantidad del carrito si está autenticado
  useEffect(() => {
    if (auth.token && auth.idUsuario) {
      getCarrito(auth.idUsuario)
        .then((carrito) => {
          const total = carrito?.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0;
          setCantidadCarrito(total);
        })
        .catch(() => setCantidadCarrito(0));
    } else {
      setCantidadCarrito(0);
    }
  }, [auth.token, auth.idUsuario]);

  const iniciarSesion = (datos) => {
    localStorage.setItem('token', datos.token);
    localStorage.setItem('idUsuario', String(datos.idUsuario));
    localStorage.setItem('rol', datos.rol);
    setAuth({ token: datos.token, idUsuario: String(datos.idUsuario), rol: datos.rol });
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('idUsuario');
    localStorage.removeItem('rol');
    setAuth({ token: null, idUsuario: null, rol: null });
    setCantidadCarrito(0);
  };

  const actualizarCarrito = (nuevoTotal) => {
    setCantidadCarrito(nuevoTotal);
  };

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-background">
        <NavBar auth={auth} onCerrarSesion={cerrarSesion} cantidadCarrito={cantidadCarrito} />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login onIniciarSesion={iniciarSesion} />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/productos" element={<Productos auth={auth} onActualizarCarrito={actualizarCarrito} />} />
            <Route path="/productos/:id" element={<DetalleProducto auth={auth} onActualizarCarrito={actualizarCarrito} />} />
            <Route
              path="/carrito"
              element={
                <RutaProtegida auth={auth}>
                  <Carrito auth={auth} onActualizarCarrito={actualizarCarrito} />
                </RutaProtegida>
              }
            />
            <Route
              path="/vendedor"
              element={
                <RutaProtegida auth={auth} rolRequerido="VENDEDOR">
                  <PanelVendedor auth={auth} />
                </RutaProtegida>
              }
            />
            <Route
              path="/compras"
              element={
                <RutaProtegida auth={auth}>
                  <HistorialCompras auth={auth} />
                </RutaProtegida>
              }
            />
            <Route
              path="/admin"
              element={
                <RutaProtegida auth={auth} rolRequerido="ADMIN">
                  <PanelAdmin auth={auth} />
                </RutaProtegida>
              }
            />
            <Route
              path="/moderador"
              element={
                <RutaProtegida auth={auth} rolRequerido="MODERATOR">
                  <PanelModerador auth={auth} />
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
  );
}


export default App;
