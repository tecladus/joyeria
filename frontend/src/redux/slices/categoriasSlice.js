import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCategorias,
  crearCategoria,
  eliminarCategoria,
  editarCategoria
} from '../../services/api';

export const fetchCategorias = createAsyncThunk(
  'categorias/fetchCategorias',
  async (_, { rejectWithValue }) => {
    try {
      return await getCategorias();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const crearNuevaCategoria = createAsyncThunk(
  'categorias/crearNuevaCategoria',
  async (datos, { rejectWithValue }) => {
    try {
      return await crearCategoria(datos);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const eliminarCategoriaExistente = createAsyncThunk(
  'categorias/eliminarCategoriaExistente',
  async (id, { rejectWithValue }) => {
    try {
      await eliminarCategoria(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const editarCategoriaExistente = createAsyncThunk(
  'categorias/editarCategoriaExistente',
  async ({ id, datos }, { rejectWithValue }) => {
    try {
      return await editarCategoria(id, datos);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const categoriasSlice = createSlice({
  name: 'categorias',
  initialState: {
    items: [],
    cargando: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Categorías
      .addCase(fetchCategorias.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(fetchCategorias.fulfilled, (state, action) => {
        state.cargando = false;
        state.items = action.payload || [];
      })
      .addCase(fetchCategorias.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.payload;
      })
      // Crear Categoría
      .addCase(crearNuevaCategoria.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Eliminar Categoría
      .addCase(eliminarCategoriaExistente.fulfilled, (state, action) => {
        state.items = state.items.filter((c) => c.idCategoria !== action.payload);
      })
      // Editar Categoría
      .addCase(editarCategoriaExistente.fulfilled, (state, action) => {
        const index = state.items.findIndex((c) => c.idCategoria === action.payload.idCategoria);
        if (index >= 0) {
          state.items[index] = action.payload;
        }
      });
  }
});

export default categoriasSlice.reducer;
