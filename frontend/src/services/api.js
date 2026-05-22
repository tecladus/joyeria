const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8080/api'
  : '/api';

/* Construye los headers. Los endpoints públicos (GET productos/categorías) no necesitan auth. */
const getHeaders = (conAuth = true) => {
  const headers = { 'Content-Type': 'application/json' };
  if (conAuth) {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/* Maneja la respuesta de fetch: lanza un error con el mensaje del backend si falla. */
const manejarRespuesta = async (res) => {
  if (!res.ok) {
    let mensajeError = `Error ${res.status}`;
    try {
      const cuerpo = await res.json();
      mensajeError = cuerpo.message || cuerpo.error || mensajeError;
    } catch {
      // Si no hay JSON en el error, se usa el mensaje genérico
    }
    throw new Error(mensajeError);
  }
  // Algunas respuestas (como DELETE exitoso) no tienen cuerpo
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return null;
};

// ========================
//        USUARIOS
// ========================

export const loginUsuario = async (email, password) => {
  const res = await fetch(`${BASE_URL}/usuarios/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return manejarRespuesta(res);
};

export const registrarUsuario = async (datos) => {
  const res = await fetch(`${BASE_URL}/usuarios/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  return manejarRespuesta(res);
};

// ========================
//        PRODUCTOS
// ========================

export const getProductos = async () => {
  const res = await fetch(`${BASE_URL}/productos`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return manejarRespuesta(res);
};

export const getProductoPorId = async (id) => {
  const res = await fetch(`${BASE_URL}/productos/${id}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return manejarRespuesta(res);
};

export const getProductosPorCategoria = async (categoriaId) => {
  const res = await fetch(`${BASE_URL}/productos/categoria/${categoriaId}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return manejarRespuesta(res);
};

export const crearProducto = async (vendedorId, datos) => {
  const res = await fetch(`${BASE_URL}/productos?vendedorId=${vendedorId}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(datos),
  });
  return manejarRespuesta(res);
};

export const editarProducto = async (id, vendedorId, datos) => {
  const res = await fetch(`${BASE_URL}/productos/${id}?vendedorId=${vendedorId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(datos),
  });
  return manejarRespuesta(res);
};

export const eliminarProducto = async (id, vendedorId) => {
  const res = await fetch(`${BASE_URL}/productos/${id}?vendedorId=${vendedorId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return manejarRespuesta(res);
};

export const aplicarDescuento = async (id, vendedorId, descuento) => {
  const res = await fetch(
    `${BASE_URL}/productos/${id}/descuento?vendedorId=${vendedorId}&descuento=${descuento}`,
    { method: 'PATCH', headers: getHeaders() }
  );
  return manejarRespuesta(res);
};

// ========================
//       CATEGORÍAS
// ========================

export const getCategorias = async () => {
  const res = await fetch(`${BASE_URL}/categorias`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return manejarRespuesta(res);
};

// ========================
//        CARRITO
// ========================

export const getCarrito = async (usuarioId) => {
  const res = await fetch(`${BASE_URL}/carrito?usuarioId=${usuarioId}`, {
    headers: getHeaders(),
  });
  return manejarRespuesta(res);
};

export const agregarAlCarrito = async (usuarioId, productoId, cantidad = 1) => {
  const res = await fetch(`${BASE_URL}/carrito/items?usuarioId=${usuarioId}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ productoId, cantidad }),
  });
  return manejarRespuesta(res);
};

export const modificarCantidadItem = async (itemId, usuarioId, cantidad) => {
  const res = await fetch(
    `${BASE_URL}/carrito/items/${itemId}?usuarioId=${usuarioId}&cantidad=${cantidad}`,
    { method: 'PUT', headers: getHeaders() }
  );
  return manejarRespuesta(res);
};

export const eliminarDelCarrito = async (itemId, usuarioId) => {
  const res = await fetch(`${BASE_URL}/carrito/items/${itemId}?usuarioId=${usuarioId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return manejarRespuesta(res);
};

// ========================
//        ÓRDENES
// ========================

export const hacerCheckout = async (usuarioId) => {
  const res = await fetch(`${BASE_URL}/ordenes/checkout?usuarioId=${usuarioId}`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return manejarRespuesta(res);
};

export const getOrdenes = async (usuarioId) => {
  const res = await fetch(`${BASE_URL}/ordenes?usuarioId=${usuarioId}`, {
    headers: getHeaders(),
  });
  return manejarRespuesta(res);
};
