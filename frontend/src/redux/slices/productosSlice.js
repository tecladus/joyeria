import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getProductos,
  getProductoPorId,
  crearProducto,
  editarProducto,
  eliminarProducto,
  aplicarDescuento
} from '../../services/api';

export const fetchProductos = createAsyncThunk(
  'productos/fetchProductos',
  async (_, { rejectWithValue }) => {
    try {
      return await getProductos();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProductoPorId = createAsyncThunk(
  'productos/fetchProductoPorId',
  async (id, { rejectWithValue }) => {
    try {
      return await getProductoPorId(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const crearNuevoProducto = createAsyncThunk(
  'productos/crearNuevoProducto',
  async ({ vendedorId, datos }, { rejectWithValue }) => {
    try {
      return await crearProducto(vendedorId, datos);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const editarProductoExistente = createAsyncThunk(
  'productos/editarProductoExistente',
  async ({ id, vendedorId, datos }, { rejectWithValue }) => {
    try {
      return await editarProducto(id, vendedorId, datos);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const eliminarProductoExistente = createAsyncThunk(
  'productos/eliminarProductoExistente',
  async ({ id, vendedorId }, { rejectWithValue }) => {
    try {
      await eliminarProducto(id, vendedorId);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const aplicarDescuentoProducto = createAsyncThunk(
  'productos/aplicarDescuentoProducto',
  async ({ id, vendedorId, descuento }, { rejectWithValue }) => {
    try {
      return await aplicarDescuento(id, vendedorId, descuento);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const productosSlice = createSlice({
  name: 'productos',
  initialState: {
    items: [],
    itemSeleccionado: null,
    cargando: false,
    error: null
  },
  reducers: {
    limpiarItemSeleccionado: (state) => {
      state.itemSeleccionado = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Productos
      .addCase(fetchProductos.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(fetchProductos.fulfilled, (state, action) => {
        state.cargando = false;
        state.items = action.payload || [];
      })
      .addCase(fetchProductos.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.payload;
      })
      // Fetch Producto Por Id
      .addCase(fetchProductoPorId.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(fetchProductoPorId.fulfilled, (state, action) => {
        state.cargando = false;
        state.itemSeleccionado = action.payload;
      })
      .addCase(fetchProductoPorId.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.payload;
      })
      // Crear Producto
      .addCase(crearNuevoProducto.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      // Editar Producto
      .addCase(editarProductoExistente.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.idProducto === action.payload.idProducto);
        if (index >= 0) {
          state.items[index] = action.payload;
        }
        if (state.itemSeleccionado?.idProducto === action.payload.idProducto) {
          state.itemSeleccionado = action.payload;
        }
      })
      // Eliminar Producto
      .addCase(eliminarProductoExistente.fulfilled, (state, action) => {
        state.items = state.items.filter((p) => p.idProducto !== action.payload);
        if (state.itemSeleccionado?.idProducto === action.payload) {
          state.itemSeleccionado = null;
        }
      })
      // Aplicar Descuento
      .addCase(aplicarDescuentoProducto.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.idProducto === action.payload.idProducto);
        if (index >= 0) {
          state.items[index] = action.payload;
        }
        if (state.itemSeleccionado?.idProducto === action.payload.idProducto) {
          state.itemSeleccionado = action.payload;
        }
      });
  }
});

export const { limpiarItemSeleccionado } = productosSlice.actions;
export default productosSlice.reducer;
