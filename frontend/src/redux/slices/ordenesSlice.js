import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getOrdenes,
  getTodasLasOrdenes,
  actualizarEstadoOrden
} from '../../services/api';

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
