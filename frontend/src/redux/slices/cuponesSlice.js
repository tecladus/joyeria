import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCupones,
  crearCupon,
  editarCupon,
  eliminarCupon,
} from '../../services/api';

// Listado de cupones (panel de Admin)
export const fetchCupones = createAsyncThunk(
  'cupones/fetchCupones',
  async (_, { rejectWithValue }) => {
    try {
      return await getCupones();
    } catch (error) {
      return rejectWithValue(error.message || 'Error al obtener los cupones.');
    }
  }
);

export const crearNuevoCupon = createAsyncThunk(
  'cupones/crearNuevoCupon',
  async (datos, { rejectWithValue }) => {
    try {
      return await crearCupon(datos);
    } catch (error) {
      return rejectWithValue(error.message || 'Error al crear el cupón.');
    }
  }
);

export const editarCuponExistente = createAsyncThunk(
  'cupones/editarCuponExistente',
  async ({ id, datos }, { rejectWithValue }) => {
    try {
      return await editarCupon(id, datos);
    } catch (error) {
      return rejectWithValue(error.message || 'Error al editar el cupón.');
    }
  }
);

export const eliminarCuponExistente = createAsyncThunk(
  'cupones/eliminarCuponExistente',
  async (id, { rejectWithValue }) => {
    try {
      await eliminarCupon(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al eliminar el cupón.');
    }
  }
);

const cuponesSlice = createSlice({
  name: 'cupones',
  initialState: {
    items: [],
    cargando: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCupones.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(fetchCupones.fulfilled, (state, action) => {
        state.cargando = false;
        state.items = action.payload || [];
      })
      .addCase(fetchCupones.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.payload;
      })
      .addCase(crearNuevoCupon.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(editarCuponExistente.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c.idCupon === action.payload.idCupon);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(eliminarCuponExistente.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.idCupon !== action.payload);
      });
  },
});

export default cuponesSlice.reducer;
