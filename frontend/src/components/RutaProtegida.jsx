import { Navigate } from 'react-router-dom';

/* Protege rutas que requieren autenticación y opcionalmente un rol específico. */
function RutaProtegida({ auth, children, rolRequerido }) {
  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }
  if (rolRequerido && auth.rol !== rolRequerido) {
    return <Navigate to="/productos" replace />;
  }
  return children;
}

export default RutaProtegida;
