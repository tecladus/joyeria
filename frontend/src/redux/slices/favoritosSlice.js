import { createSlice } from '@reduxjs/toolkit';

const getFavoritosFromStorage = (userId) => {
  const key = `favoritos_${userId || 'guest'}`;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveFavoritosToStorage = (userId, list) => {
  const key = `favoritos_${userId || 'guest'}`;
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    console.error('Error saving favorites to localStorage', e);
  }
};

const favoritosSlice = createSlice({
  name: 'favoritos',
  initialState: {
    items: getFavoritosFromStorage(localStorage.getItem('idUsuario') || 'guest')
  },
  reducers: {
    inicializarFavoritos: (state, action) => {
      const userId = action.payload;
      state.items = getFavoritosFromStorage(userId);
    },
    toggleFavorito: (state, action) => {
      const producto = action.payload;
      const index = state.items.findIndex(item => item.idProducto === producto.idProducto);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(producto);
      }
      const userId = localStorage.getItem('idUsuario') || 'guest';
      saveFavoritosToStorage(userId, state.items);
    },
    limpiarFavoritos: (state) => {
      state.items = [];
    }
  }
});

export const { inicializarFavoritos, toggleFavorito, limpiarFavoritos } = favoritosSlice.actions;
export default favoritosSlice.reducer;
