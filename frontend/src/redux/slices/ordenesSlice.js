import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getOrdenes,
  getTodasLasOrdenes,
  actualizarEstadoOrden,
  hacerCheckout,
  crearPreferenciaPago,
  confirmarPagoOrden
} from '../../services/api';

// Thunk para concretar el checkout del carrito
export const checkout = createAsyncThunk(
  'ordenes/checkout',
  async ({ idUsuario, datosCheckout }, { rejectWithValue }) => {
    try {
      return await hacerCheckout(idUsuario, datosCheckout);
    } catch (error) {
      return rejectWithValue(error.message || 'Error al procesar el pedido.');
    }
  }
);

// Thunk para crear la preferencia de pago de Mercado Pago
export const crearPreferencia = createAsyncThunk(
  'ordenes/crearPreferencia',
  async ({ idUsuario, datosCheckout }, { rejectWithValue }) => {
    try {
      const res = await crearPreferenciaPago(idUsuario, datosCheckout);
      if (!res || !res.initPoint) {
        return rejectWithValue('No se pudo generar la preferencia de pago de Mercado Pago.');
      }
      return res;
    } catch (error) {
      return rejectWithValue(error.message || 'No se pudo generar la preferencia de pago de Mercado Pago.');
    }
  }
);

// Thunk para confirmar el pago de una orden (retorno de Mercado Pago)
export const confirmarPago = createAsyncThunk(
  'ordenes/confirmarPago',
  async ({ ordenId, status }, { rejectWithValue }) => {
    try {
      return await confirmarPagoOrden(ordenId, status);
    } catch (error) {
      return rejectWithValue(error.message || 'Ocurrió un error al procesar el pago.');
    }
  }
);

export const fetchOrdenes = createAsyncThunk(
  'ordenes/fetchOrdenes',
  async (usuarioId, { rejectWithValue }) => {
    try {
      return await getOrdenes(usuarioId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTodasLasOrdenes = createAsyncThunk(
  'ordenes/fetchTodasLasOrdenes',
  async (_, { rejectWithValue }) => {
    try {
      return await getTodasLasOrdenes();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const actualizarEstadoOrdenExistente = createAsyncThunk(
  'ordenes/actualizarEstadoOrdenExistente',
  async ({ id, estado }, { rejectWithValue }) => {
    try {
      return await actualizarEstadoOrden(id, estado);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const ordenesSlice = createSlice({
  name: 'ordenes',
  initialState: {
    items: [],
    todasLasOrdenes: [],
    cargando: false,
    error: null
  },
  reducers: {
    limpiarOrdenes: (state) => {
      state.items = [];
      state.todasLasOrdenes = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Ordenes (Usuario)
      .addCase(fetchOrdenes.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(fetchOrdenes.fulfilled, (state, action) => {
        state.cargando = false;
        state.items = action.payload || [];
      })
      .addCase(fetchOrdenes.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.payload;
      })
      // Fetch Todas las Ordenes (Admin/Moderador)
      .addCase(fetchTodasLasOrdenes.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(fetchTodasLasOrdenes.fulfilled, (state, action) => {
        state.cargando = false;
        state.todasLasOrdenes = action.payload || [];
      })
      .addCase(fetchTodasLasOrdenes.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.payload;
      })
      // Actualizar Estado Orden
      .addCase(actualizarEstadoOrdenExistente.fulfilled, (state, action) => {
        const indexUser = state.items.findIndex((o) => o.idOrden === action.payload.idOrden);
        if (indexUser >= 0) {
          state.items[indexUser] = action.payload;
        }
        const indexAll = state.todasLasOrdenes.findIndex((o) => o.idOrden === action.payload.idOrden);
        if (indexAll >= 0) {
          state.todasLasOrdenes[indexAll] = action.payload;
        }
      });
  }
});

export const { limpiarOrdenes } = ordenesSlice.actions;
export default ordenesSlice.reducer;
