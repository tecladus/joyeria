import { createSlice } from '@reduxjs/toolkit';

// Favoritos por usuario: { [idUsuario]: [productos] }
// La persistencia la maneja redux-persist (slice en whitelist), sin localStorage manual.
const favoritosSlice = createSlice({
  name: 'favoritos',
  initialState: {
    porUsuario: {},
  },
  reducers: {
    toggleFavoritoDeUsuario: (state, action) => {
      const { userId, producto } = action.payload;
      if (!userId) return;
      if (!state.porUsuario) state.porUsuario = {};

      const lista = state.porUsuario[userId] || [];
      const index = lista.findIndex((item) => item.idProducto === producto.idProducto);
      if (index >= 0) {
        lista.splice(index, 1);
      } else {
        lista.push(producto);
      }
      state.porUsuario[userId] = lista;
    },
    limpiarFavoritos: (state, action) => {
      const userId = action.payload;
      if (!state.porUsuario) state.porUsuario = {};
      if (userId) {
        state.porUsuario[userId] = [];
      }
    },
  },
});

// Thunk: obtiene el usuario actual desde el store y hace el toggle
export const toggleFavorito = (producto) => (dispatch, getState) => {
  const userId = getState().auth.idUsuario;
  if (!userId) return;
  dispatch(favoritosSlice.actions.toggleFavoritoDeUsuario({ userId, producto }));
};

// Selector: favoritos del usuario logueado (lista vacía si no hay sesión)
// Defensivo ante estados persistidos con forma antigua (sin porUsuario)
const LISTA_VACIA = [];
export const selectFavoritos = (state) => {
  const porUsuario = state.favoritos?.porUsuario || {};
  return porUsuario[state.auth?.idUsuario] || LISTA_VACIA;
};

export const { limpiarFavoritos } = favoritosSlice.actions;
export default favoritosSlice.reducer;
