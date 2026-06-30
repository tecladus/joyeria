import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
// Importar desde es/ (ESM): el build de lib/ (CommonJS) rompe el interop en el bundle de producción
import storage from 'redux-persist/es/storage';
import { configurarObtencionToken } from '../services/api';
import authReducer from './slices/authSlice';
import carritoReducer from './slices/carritoSlice';
import themeReducer from './slices/themeSlice';
import favoritosReducer from './slices/favoritosSlice';
import productosReducer from './slices/productosSlice';
import categoriasReducer from './slices/categoriasSlice';
import ordenesReducer from './slices/ordenesSlice';
import usuariosReducer from './slices/usuariosSlice';
import contactoReducer from './slices/contactoSlice';
import cuponesReducer from './slices/cuponesSlice';
import puntosReducer from './slices/puntosSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  carrito: carritoReducer,
  theme: themeReducer,
  favoritos: favoritosReducer,
  productos: productosReducer,
  categorias: categoriasReducer,
  ordenes: ordenesReducer,
  usuarios: usuariosReducer,
  contacto: contactoReducer,
  cupones: cuponesReducer,
  puntos: puntosReducer,
});

// Solo se persisten sesión, tema y favoritos; el resto se vuelve a pedir al backend
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'theme', 'favoritos'],
  version: 1,
  // Normaliza estados persistidos con formas antiguas para evitar crashes al rehidratar
  migrate: (estadoPersistido) => {
    if (estadoPersistido && estadoPersistido.favoritos && !estadoPersistido.favoritos.porUsuario) {
      estadoPersistido.favoritos = { porUsuario: {} };
    }
    return Promise.resolve(estadoPersistido);
  },
};

export const store = configureStore({
  reducer: persistReducer(persistConfig, rootReducer),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// El interceptor de axios obtiene el token desde el store (sin localStorage manual)
configurarObtencionToken(() => store.getState().auth.token);
