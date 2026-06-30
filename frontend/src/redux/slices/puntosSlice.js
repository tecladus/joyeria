import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPuntos } from '../../services/api';

// Saldo e historial de puntos del usuario autenticado.
export const fetchPuntos = createAsyncThunk(
  'puntos/fetchPuntos',
  async (_, { rejectWithValue }) => {
    try {
      return await getPuntos();
    } catch (error) {
      return rejectWithValue(error.message || 'Error al obtener los puntos.');
    }
  }
);

const initialState = {
  saldo: 0,
  valorEnDinero: 0,
  puntosPorPeso: 1,
  bloqueCanje: 100,
  valorBloque: 5,
  historial: [],
  cargando: false,
  error: null,
};

const puntosSlice = createSlice({
  name: 'puntos',
  initialState,
  reducers: {
    limpiarPuntos: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPuntos.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(fetchPuntos.fulfilled, (state, action) => {
        const p = action.payload || {};
        state.cargando = false;
        state.saldo = p.saldo ?? 0;
        state.valorEnDinero = p.valorEnDinero ?? 0;
        state.puntosPorPeso = p.puntosPorPeso ?? 1;
        state.bloqueCanje = p.bloqueCanje ?? 100;
        state.valorBloque = p.valorBloque ?? 5;
        state.historial = p.historial || [];
      })
      .addCase(fetchPuntos.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.payload;
      });
  },
});

export const { limpiarPuntos } = puntosSlice.actions;
export default puntosSlice.reducer;
