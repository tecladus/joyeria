import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCarrito,
  agregarAlCarrito,
  modificarCantidadItem,
  eliminarDelCarrito,
} from '../../services/api';
import { checkout, crearPreferencia } from './ordenesSlice';

const calcularCantidad = (carrito) =>
  carrito?.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0;

// Thunk para cargar el carrito completo
export const fetchCarrito = createAsyncThunk(
  'carrito/fetchCarrito',
  async (idUsuario, { rejectWithValue }) => {
    try {
      return await getCarrito(idUsuario);
    } catch (error) {
      return rejectWithValue(error.message || 'No se pudo cargar el carrito.');
    }
  }
);

// Thunk para agregar un producto al carrito
export const agregarProductoAlCarrito = createAsyncThunk(
  'carrito/agregarProducto',
  async ({ idUsuario, productoId, cantidad = 1 }, { rejectWithValue }) => {
    try {
      return await agregarAlCarrito(idUsuario, productoId, cantidad);
    } catch (error) {
      return rejectWithValue(error.message || 'Error al agregar al carrito');
    }
  }
);

// Thunk para modificar la cantidad de un item
export const cambiarCantidadItem = createAsyncThunk(
  'carrito/cambiarCantidadItem',
  async ({ itemId, idUsuario, cantidad }, { rejectWithValue }) => {
    try {
      return await modificarCantidadItem(itemId, idUsuario, cantidad);
    } catch (error) {
      return rejectWithValue(error.message || 'Error al modificar la cantidad.');
    }
  }
);

// Thunk para eliminar un item (si el backend no devuelve el carrito, lo vuelve a pedir)
export const quitarItemDelCarrito = createAsyncThunk(
  'carrito/quitarItem',
  async ({ itemId, idUsuario }, { rejectWithValue }) => {
    try {
      const actualizado = await eliminarDelCarrito(itemId, idUsuario);
      if (actualizado) return actualizado;
      return await getCarrito(idUsuario);
    } catch (error) {
      return rejectWithValue(error.message || 'Error al eliminar el producto.');
    }
  }
);

const initialState = {
  carrito: null,
  cantidadCarrito: 0,
  cargando: true,
  operando: false,
  error: null,
};

const aplicarCarrito = (state, carrito) => {
  state.carrito = carrito;
  state.cantidadCarrito = calcularCantidad(carrito);
};

const carritoSlice = createSlice({
  name: 'carrito',
  initialState,
  reducers: {
    resetCarrito: (state) => {
      state.carrito = null;
      state.cantidadCarrito = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCarrito.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(fetchCarrito.fulfilled, (state, action) => {
        state.cargando = false;
        aplicarCarrito(state, action.payload);
      })
      .addCase(fetchCarrito.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.payload;
      })
      .addCase(agregarProductoAlCarrito.fulfilled, (state, action) => {
        aplicarCarrito(state, action.payload);
      })
      .addCase(cambiarCantidadItem.pending, (state) => {
        state.operando = true;
        state.error = null;
      })
      .addCase(cambiarCantidadItem.fulfilled, (state, action) => {
        state.operando = false;
        aplicarCarrito(state, action.payload);
      })
      .addCase(cambiarCantidadItem.rejected, (state, action) => {
        state.operando = false;
        state.error = action.payload;
      })
      .addCase(quitarItemDelCarrito.pending, (state) => {
        state.operando = true;
        state.error = null;
      })
      .addCase(quitarItemDelCarrito.fulfilled, (state, action) => {
        state.operando = false;
        aplicarCarrito(state, action.payload);
      })
      .addCase(quitarItemDelCarrito.rejected, (state, action) => {
        state.operando = false;
        state.error = action.payload;
      })
      // Al concretar un checkout (u obtener preferencia de pago) se vacía el carrito local
      .addCase(checkout.pending, (state) => {
        state.operando = true;
      })
      .addCase(checkout.fulfilled, (state) => {
        state.operando = false;
        state.carrito = null;
        state.cantidadCarrito = 0;
      })
      .addCase(checkout.rejected, (state) => {
        state.operando = false;
      })
      .addCase(crearPreferencia.pending, (state) => {
        state.operando = true;
      })
      .addCase(crearPreferencia.fulfilled, (state) => {
        state.operando = false;
        state.carrito = null;
        state.cantidadCarrito = 0;
      })
      .addCase(crearPreferencia.rejected, (state) => {
        state.operando = false;
      });
  },
});

export const { resetCarrito } = carritoSlice.actions;
export default carritoSlice.reducer;
