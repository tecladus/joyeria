import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import carritoReducer from './slices/carritoSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    carrito: carritoReducer,
  },
});
