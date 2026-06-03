import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import carritoReducer from './slices/carritoSlice';
import themeReducer from './slices/themeSlice';
import favoritosReducer from './slices/favoritosSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    carrito: carritoReducer,
    theme: themeReducer,
    favoritos: favoritosReducer,
  },
});
