import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { enviarContacto } from '../../services/api';

// Thunk para enviar el formulario de contacto
export const enviarMensajeContacto = createAsyncThunk(
  'contacto/enviarMensaje',
  async (datosContacto, { rejectWithValue }) => {
    try {
      return await enviarContacto(datosContacto);
    } catch (error) {
      return rejectWithValue(error.message || 'Error al enviar el mensaje. Intente de nuevo.');
    }
  }
);

const contactoSlice = createSlice({
  name: 'contacto',
  initialState: {
    enviando: false,
    error: null,
  },
  reducers: {
    limpiarErrorContacto: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(enviarMensajeContacto.pending, (state) => {
        state.enviando = true;
        state.error = null;
      })
      .addCase(enviarMensajeContacto.fulfilled, (state) => {
        state.enviando = false;
      })
      .addCase(enviarMensajeContacto.rejected, (state, action) => {
        state.enviando = false;
        state.error = action.payload;
      });
  },
});

export const { limpiarErrorContacto } = contactoSlice.actions;
export default contactoSlice.reducer;
