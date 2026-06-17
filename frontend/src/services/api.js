import axios from 'axios';

const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8080/api'
  : '/api';

const api = axios.create({
  baseURL: BASE_URL,
});

// Función inyectada desde el store para obtener el token de Redux
// (evita dependencias circulares y el uso manual de localStorage)
let obtenerToken = () => null;
export const configurarObtencionToken = (fn) => {
  obtenerToken = fn;
};

/* Maneja la respuesta de error de axios: extrae el mensaje adecuado y lo traduce si es genérico */
const manejarErrorAxios = (error) => {
  let mensajeError = '';
  let status = 0;

  if (error.response) {
    status = error.response.status;
    const cuerpo = error.response.data;
    if (cuerpo && typeof cuerpo === 'object') {
      if (cuerpo.message || cuerpo.error) {
        mensajeError = cuerpo.message || cuerpo.error || '';
      } else {
        const valores = Object.values(cuerpo);
        if (valores.length > 0) {
          mensajeError = valores.join(' ');
        }
      }
    }
  } else if (error.request) {
    status = 500;
    mensajeError = 'No se pudo conectar con el servidor. Verifica tu conexión de red.';
  } else {
    status = 400;
    mensajeError = error.message;
  }

  const mensajesGenericos = [
    'forbidden',
    'unauthorized',
    'bad request',
    'internal server error',
    'not found',
    'access denied',
    'access_denied',
    'no message available'
  ];

  const esGenerico = !mensajeError || mensajesGenericos.includes(mensajeError.toLowerCase().trim());

  if (esGenerico) {
    switch (status) {
      case 400:
        mensajeError = 'La solicitud es inválida o contiene datos incorrectos.';
        break;
      case 401:
        mensajeError = 'No estás autenticado o tu sesión ha expirado. Por favor, inicia sesión.';
        break;
      case 403:
        mensajeError = 'No tienes permisos suficientes para realizar esta acción.';
        break;
      case 404:
        mensajeError = 'El recurso solicitado no existe.';
        break;
      case 429:
        mensajeError = 'Has realizado demasiados intentos en poco tiempo. Por favor, espera un momento.';
        break;
      case 500:
        mensajeError = 'Ocurrió un error en el servidor. Por favor, intenta de nuevo más tarde.';
        break;
      default:
        mensajeError = `Ocurrió un error inesperado (Código ${status}).`;
    }
  }
  return new Error(mensajeError);
};

// Interceptor de solicitudes para inyectar dinámicamente el token si corresponde
api.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};
    config.headers['Content-Type'] = 'application/json';

    const conAuth = config.conAuth !== false;
    if (conAuth) {
      const token = obtenerToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuestas para retornar directamente la data o procesar errores
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorProcesado = manejarErrorAxios(error);
    return Promise.reject(errorProcesado);
  }
);

// ========================
//        USUARIOS
// ========================

export const loginUsuario = async (email, password) => {
  return api.post('/usuarios/login', { email, password }, { conAuth: false });
};

export const getPerfilUsuario = async () => {
  return api.get('/usuarios/perfil');
};

export const registrarUsuario = async (datos) => {
  return api.post('/usuarios/registro', datos, { conAuth: false });
};

// ========================
//        PRODUCTOS
// ========================

export const getProductos = async () => {
  return api.get('/productos', { conAuth: false });
};

export const getProductoPorId = async (id) => {
  return api.get(`/productos/${id}`, { conAuth: false });
};

export const getProductosPorCategoria = async (categoriaId) => {
  return api.get(`/productos/categoria/${categoriaId}`, { conAuth: false });
};

export const crearProducto = async (vendedorId, datos) => {
  return api.post(`/productos?vendedorId=${vendedorId}`, datos);
};

export const editarProducto = async (id, vendedorId, datos) => {
  return api.put(`/productos/${id}?vendedorId=${vendedorId}`, datos);
};

export const eliminarProducto = async (id, vendedorId) => {
  return api.delete(`/productos/${id}?vendedorId=${vendedorId}`);
};

export const aplicarDescuento = async (id, vendedorId, descuento) => {
  return api.patch(`/productos/${id}/descuento?vendedorId=${vendedorId}&descuento=${descuento}`);
};

// ========================
//       CATEGORÍAS
// ========================

export const getCategorias = async () => {
  return api.get('/categorias', { conAuth: false });
};

// ========================
//        CARRITO
// ========================

export const getCarrito = async (usuarioId) => {
  return api.get(`/carrito?usuarioId=${usuarioId}`);
};

export const agregarAlCarrito = async (usuarioId, productoId, cantidad = 1) => {
  return api.post(`/carrito/items?usuarioId=${usuarioId}`, { productoId, cantidad });
};

export const modificarCantidadItem = async (itemId, usuarioId, cantidad) => {
  return api.put(`/carrito/items/${itemId}?usuarioId=${usuarioId}&cantidad=${cantidad}`);
};

export const eliminarDelCarrito = async (itemId, usuarioId) => {
  return api.delete(`/carrito/items/${itemId}?usuarioId=${usuarioId}`);
};

// ========================
//        ÓRDENES
// ========================

export const hacerCheckout = async (usuarioId, datosCheckout) => {
  return api.post(`/ordenes/checkout?usuarioId=${usuarioId}`, datosCheckout);
};

export const getOrdenes = async (usuarioId) => {
  return api.get(`/ordenes?usuarioId=${usuarioId}`);
};

export const crearPreferenciaPago = async (usuarioId, datosCheckout) => {
  return api.post(`/ordenes/checkout/preferencia?usuarioId=${usuarioId}`, datosCheckout);
};

export const confirmarPagoOrden = async (ordenId, status) => {
  return api.post(`/ordenes/${ordenId}/confirmar-pago?status=${status}`);
};

// ========================
//      ADMIN / MODERADOR
// ========================

export const getUsuarios = async () => {
  return api.get('/usuarios');
};

export const cambiarRolUsuario = async (id, nuevoRolId) => {
  return api.put(`/usuarios/${id}/rol?nuevoRolId=${nuevoRolId}`);
};

export const eliminarUsuario = async (id) => {
  return api.delete(`/usuarios/${id}`);
};

export const getTodasLasOrdenes = async () => {
  return api.get('/ordenes/todas');
};

export const actualizarEstadoOrden = async (id, estado) => {
  return api.patch(`/ordenes/${id}/estado?estado=${estado}`);
};

export const crearCategoria = async (datos) => {
  return api.post('/categorias', datos);
};

export const eliminarCategoria = async (id) => {
  return api.delete(`/categorias/${id}`);
};

export const editarCategoria = async (id, datos) => {
  return api.put(`/categorias/${id}`, datos);
};

export const convertirseEnVendedor = async () => {
  return api.put('/usuarios/ser-vendedor');
};

export const enviarContacto = async (datosContacto) => {
  return api.post('/contacto', datosContacto, { conAuth: false });
};

// ========================
//      PRODE MUNDIAL
// ========================

export const getPartidosProde = async () => {
  return api.get('/prode/partidos', { conAuth: false });
};

export const getRankingProde = async () => {
  return api.get('/prode/ranking', { conAuth: false });
};

export const getParticipanteProde = async (alias) => {
  return api.get(`/prode/participantes/${encodeURIComponent(alias)}`, { conAuth: false });
};

// Requiere sesión: recupera el participante del usuario logueado (con su clave de edición).
export const getMiParticipanteProde = async () => {
  return api.get('/prode/mi-participante');
};

// Guarda los pronósticos. No fuerza conAuth: si hay token se envía (para vincular la cuenta),
// si no hay sesión, el guardado es anónimo identificado por alias + clave de edición.
export const guardarPrediccionesProde = async (datos) => {
  return api.post('/prode/predicciones', datos);
};

// Solo ADMIN/MODERATOR: carga el resultado real de un partido.
export const cargarResultadoProde = async (partidoId, golesLocal, golesVisitante) => {
  return api.put(`/prode/partidos/${partidoId}/resultado`, { golesLocal, golesVisitante });
};
