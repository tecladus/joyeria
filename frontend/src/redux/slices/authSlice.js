import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getPerfilUsuario,
  loginUsuario,
  registrarUsuario,
  convertirseEnVendedor,
} from '../../services/api';

// Thunk para iniciar sesión
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return await loginUsuario(email, password);
    } catch (error) {
      return rejectWithValue(error.message || 'Credenciales incorrectas. Intenta de nuevo.');
    }
  }
);

// Thunk para registrar un nuevo usuario
export const registro = createAsyncThunk(
  'auth/registro',
  async (datos, { rejectWithValue }) => {
    try {
      return await registrarUsuario(datos);
    } catch (error) {
      return rejectWithValue(error.message || 'No se pudo completar el registro. Intenta con otro email.');
    }
  }
);

// Thunk para convertir la cuenta en vendedor
export const convertirEnVendedor = createAsyncThunk(
  'auth/convertirEnVendedor',
  async (_, { rejectWithValue }) => {
    try {
      return await convertirseEnVendedor();
    } catch (error) {
      return rejectWithValue(error.message || 'Error al convertir la cuenta.');
    }
  }
);

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
  token: null,
  idUsuario: null,
  rol: null,
  nombre: '',
  apellido: '',
  email: '',
  direccion: '',
  telefono: '',
  cargandoPerfil: false,
  errorPerfil: null,
};

// Aplica los datos de sesión devueltos por el backend al estado
const aplicarSesion = (state, datos) => {
  state.token = datos.token;
  state.idUsuario = String(datos.idUsuario);
  state.rol = datos.rol;
  state.nombre = datos.nombre || '';
  state.apellido = datos.apellido || '';
  state.email = datos.email || '';
  state.direccion = datos.direccion || '';
  state.telefono = datos.telefono || '';
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    iniciarSesion: (state, action) => {
      aplicarSesion(state, action.payload);
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        aplicarSesion(state, action.payload);
      })
      .addCase(registro.fulfilled, (state, action) => {
        aplicarSesion(state, action.payload);
      })
      .addCase(convertirEnVendedor.fulfilled, (state, action) => {
        aplicarSesion(state, action.payload);
      })
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
      })
      .addCase(fetchPerfil.rejected, (state, action) => {
        state.cargandoPerfil = false;
        state.errorPerfil = action.payload;
      });
  },
});

export const { iniciarSesion, cerrarSesion } = authSlice.actions;
export default authSlice.reducer;
