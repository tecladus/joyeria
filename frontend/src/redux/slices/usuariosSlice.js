import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getUsuarios,
  cambiarRolUsuario,
  eliminarUsuario
} from '../../services/api';

export const fetchUsuarios = createAsyncThunk(
  'usuarios/fetchUsuarios',
  async (_, { rejectWithValue }) => {
    try {
      return await getUsuarios();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cambiarRolUsuarioExistente = createAsyncThunk(
  'usuarios/cambiarRolUsuarioExistente',
  async ({ id, nuevoRolId }, { rejectWithValue }) => {
    try {
      return await cambiarRolUsuario(id, nuevoRolId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const eliminarUsuarioExistente = createAsyncThunk(
  'usuarios/eliminarUsuarioExistente',
  async (id, { rejectWithValue }) => {
    try {
      await eliminarUsuario(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const usuariosSlice = createSlice({
  name: 'usuarios',
  initialState: {
    items: [],
    cargando: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Usuarios
      .addCase(fetchUsuarios.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(fetchUsuarios.fulfilled, (state, action) => {
        state.cargando = false;
        state.items = action.payload || [];
      })
      .addCase(fetchUsuarios.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.payload;
      })
      // Cambiar Rol
      .addCase(cambiarRolUsuarioExistente.fulfilled, (state, action) => {
        const index = state.items.findIndex((u) => u.idUsuario === action.payload.idUsuario);
        if (index >= 0) {
          state.items[index] = action.payload;
        }
      })
      // Eliminar Usuario
      .addCase(eliminarUsuarioExistente.fulfilled, (state, action) => {
        state.items = state.items.filter((u) => u.idUsuario !== action.payload);
      });
  }
});

export default usuariosSlice.reducer;
