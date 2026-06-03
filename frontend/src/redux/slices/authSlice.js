import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPerfilUsuario } from '../../services/api';

// Thunk para cargar el perfil del usuario
export const fetchPerfil = createAsyncThunk(
  'auth/fetchPerfil',
  async (_, { rejectWithValue }) => {
    try {
      const perfil = await getPerfilUsuario();
      return perfil;
    } catch (error) {
      return rejectWithValue(error.message || 'Error al obtener el perfil');
    }
  }
);

const initialState = {
  token: localStorage.getItem('token') || null,
  idUsuario: localStorage.getItem('idUsuario') || null,
  rol: localStorage.getItem('rol') || null,
  nombre: localStorage.getItem('nombre') || '',
  apellido: localStorage.getItem('apellido') || '',
  email: localStorage.getItem('email') || '',
  direccion: localStorage.getItem('direccion') || '',
  telefono: localStorage.getItem('telefono') || '',
  cargandoPerfil: false,
  errorPerfil: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    iniciarSesion: (state, action) => {
      const datos = action.payload;
      state.token = datos.token;
      state.idUsuario = String(datos.idUsuario);
      state.rol = datos.rol;
      state.nombre = datos.nombre || '';
      state.apellido = datos.apellido || '';
      state.email = datos.email || '';
      state.direccion = datos.direccion || '';
      state.telefono = datos.telefono || '';

      localStorage.setItem('token', datos.token);
      localStorage.setItem('idUsuario', String(datos.idUsuario));
      localStorage.setItem('rol', datos.rol);
      localStorage.setItem('nombre', datos.nombre || '');
      localStorage.setItem('apellido', datos.apellido || '');
      localStorage.setItem('email', datos.email || '');
      localStorage.setItem('direccion', datos.direccion || '');
      localStorage.setItem('telefono', datos.telefono || '');
    },
    cerrarSesion: (state) => {
      state.token = null;
      state.idUsuario = null;
      state.rol = null;
      state.nombre = '';
      state.apellido = '';
      state.email = '';
      state.direccion = '';
      state.telefono = '';

      localStorage.removeItem('token');
      localStorage.removeItem('idUsuario');
      localStorage.removeItem('rol');
      localStorage.removeItem('nombre');
      localStorage.removeItem('apellido');
      localStorage.removeItem('email');
      localStorage.removeItem('direccion');
      localStorage.removeItem('telefono');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPerfil.pending, (state) => {
        state.cargandoPerfil = true;
        state.errorPerfil = null;
      })
      .addCase(fetchPerfil.fulfilled, (state, action) => {
        const perfil = action.payload;
        state.cargandoPerfil = false;
        state.nombre = perfil.nombre || '';
        state.apellido = perfil.apellido || '';
        state.email = perfil.email || '';
        state.direccion = perfil.direccion || '';
        state.telefono = perfil.telefono || '';

        localStorage.setItem('nombre', perfil.nombre || '');
        localStorage.setItem('apellido', perfil.apellido || '');
        localStorage.setItem('email', perfil.email || '');
        localStorage.setItem('direccion', perfil.direccion || '');
        localStorage.setItem('telefono', perfil.telefono || '');
      })
      .addCase(fetchPerfil.rejected, (state, action) => {
        state.cargandoPerfil = false;
        state.errorPerfil = action.payload;
      });
  },
});

export const { iniciarSesion, cerrarSesion } = authSlice.actions;
export default authSlice.reducer;
