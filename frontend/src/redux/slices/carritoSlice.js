import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCarrito } from '../../services/api';

// Thunk para cargar la cantidad del carrito
export const fetchCantidadCarrito = createAsyncThunk(
  'carrito/fetchCantidadCarrito',
  async (idUsuario, { rejectWithValue }) => {
    try {
      const data = await getCarrito(idUsuario);
      const total = data?.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0;
      return total;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al obtener el carrito');
    }
  }
);

const initialState = {
  cantidadCarrito: 0,
  cargando: false,
  error: null,
};

const carritoSlice = createSlice({
  name: 'carrito',
  initialState,
  reducers: {
    setCantidadCarrito: (state, action) => {
      state.cantidadCarrito = action.payload;
    },
    resetCarrito: (state) => {
      state.cantidadCarrito = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCantidadCarrito.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(fetchCantidadCarrito.fulfilled, (state, action) => {
        state.cargando = false;
        state.cantidadCarrito = action.payload;
      })
      .addCase(fetchCantidadCarrito.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.payload;
      });
  },
});

export const { setCantidadCarrito, resetCarrito } = carritoSlice.actions;
export default carritoSlice.reducer;
