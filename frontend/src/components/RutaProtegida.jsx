import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/* Protege rutas que requieren autenticación y opcionalmente un rol específico. */
function RutaProtegida({ children, rolRequerido }) {
  const auth = useSelector((state) => state.auth);

  if (!auth.token) {
    return <Navigate to="/login" replace />;
  }
  if (rolRequerido) {
    const rolesAllowed = Array.isArray(rolRequerido) ? rolRequerido : [rolRequerido];
    if (!rolesAllowed.includes(auth.rol)) {
      return <Navigate to="/productos" replace />;
    }
  }
  return children;
}

export default RutaProtegida;
