import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import carritoReducer from './slices/carritoSlice';
import themeReducer from './slices/themeSlice';
import favoritosReducer from './slices/favoritosSlice';
import productosReducer from './slices/productosSlice';
import categoriasReducer from './slices/categoriasSlice';
import ordenesReducer from './slices/ordenesSlice';
import usuariosReducer from './slices/usuariosSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    carrito: carritoReducer,
    theme: themeReducer,
    favoritos: favoritosReducer,
    productos: productosReducer,
    categorias: categoriasReducer,
    ordenes: ordenesReducer,
    usuarios: usuariosReducer,
  },
});
