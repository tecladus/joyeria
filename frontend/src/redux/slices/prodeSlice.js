import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getPartidosProde,
  getRankingProde,
  getParticipanteProde,
  getMiParticipanteProde,
  guardarPrediccionesProde,
  cargarResultadoProde,
} from '../../services/api';

// Prode del Mundial.
// Solo se persisten la identidad del jugador (miAlias + miClave) vía nested persist
// configurado en store.js; el resto (partidos, ranking, predicciones) se vuelve a pedir.

export const fetchPartidos = createAsyncThunk(
  'prode/fetchPartidos',
  async (_, { rejectWithValue }) => {
    try {
      return await getPartidosProde();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRanking = createAsyncThunk(
  'prode/fetchRanking',
  async (_, { rejectWithValue }) => {
    try {
      return await getRankingProde();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Carga los pronósticos guardados de un alias (para prellenar). Si no existe (404),
// se rechaza silenciosamente: simplemente es un alias nuevo.
export const fetchParticipante = createAsyncThunk(
  'prode/fetchParticipante',
  async (alias, { rejectWithValue }) => {
    try {
      return await getParticipanteProde(alias);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Para usuarios logueados: recupera su participante (con clave) desde el backend.
export const fetchMiParticipante = createAsyncThunk(
  'prode/fetchMiParticipante',
  async (_, { rejectWithValue }) => {
    try {
      return await getMiParticipanteProde();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const guardarPredicciones = createAsyncThunk(
  'prode/guardarPredicciones',
  async ({ alias, claveEdicion, predicciones }, { rejectWithValue }) => {
    try {
      return await guardarPrediccionesProde({ alias, claveEdicion, predicciones });
    } catch (error) {
      return rejectWithValue(error.message || 'No se pudieron guardar los pronósticos.');
    }
  }
);

export const cargarResultado = createAsyncThunk(
  'prode/cargarResultado',
  async ({ partidoId, golesLocal, golesVisitante }, { rejectWithValue }) => {
    try {
      return await cargarResultadoProde(partidoId, golesLocal, golesVisitante);
    } catch (error) {
      return rejectWithValue(error.message || 'No se pudo cargar el resultado.');
    }
  }
);

// Convierte la lista de predicciones del backend en un mapa { partidoId: {...} }.
const indexarPredicciones = (predicciones) => {
  const mapa = {};
  (predicciones || []).forEach((p) => {
    mapa[p.partidoId] = {
      golesLocal: p.golesLocal,
      golesVisitante: p.golesVisitante,
      puntos: p.puntos ?? 0,
    };
  });
  return mapa;
};

const aplicarParticipante = (state, participante, { conservarClave } = {}) => {
  if (!participante || !participante.alias) return;
  state.miAlias = participante.alias;
  if (participante.claveEdicion) {
    state.miClave = participante.claveEdicion;
  } else if (!conservarClave) {
    // Lectura pública: no viene clave. Solo se limpia si no pedimos conservarla.
    state.miClave = state.miClave || '';
  }
  state.misPredicciones = indexarPredicciones(participante.predicciones);
  state.miPuntaje = {
    puntosTotal: participante.puntosTotal ?? 0,
    exactos: participante.exactos ?? 0,
  };
  state.usuarioVinculado = !!participante.usuarioVinculado;
};

const initialState = {
  partidos: [],
  ranking: [],
  // Identidad del jugador (miAlias + miClave se persisten).
  miAlias: '',
  miClave: '',
  usuarioVinculado: false,
  // Pronósticos en edición: { [partidoId]: { golesLocal, golesVisitante, puntos } }
  misPredicciones: {},
  miPuntaje: null,
  cargandoPartidos: false,
  cargandoRanking: false,
  cargandoMis: false,
  guardando: false,
  error: null,
};

const prodeSlice = createSlice({
  name: 'prode',
  initialState,
  reducers: {
    setMiAlias: (state, action) => {
      state.miAlias = action.payload;
    },
    setMiClave: (state, action) => {
      state.miClave = action.payload;
    },
    // Actualiza el marcador pronosticado de un partido mientras el usuario edita.
    setPrediccionLocal: (state, action) => {
      const { partidoId, golesLocal, golesVisitante } = action.payload;
      const previa = state.misPredicciones[partidoId] || {};
      state.misPredicciones[partidoId] = {
        golesLocal,
        golesVisitante,
        puntos: previa.puntos ?? 0,
      };
    },
    limpiarProde: (state) => {
      state.miAlias = '';
      state.miClave = '';
      state.usuarioVinculado = false;
      state.misPredicciones = {};
      state.miPuntaje = null;
    },
    limpiarErrorProde: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Partidos
      .addCase(fetchPartidos.pending, (state) => {
        state.cargandoPartidos = true;
        state.error = null;
      })
      .addCase(fetchPartidos.fulfilled, (state, action) => {
        state.cargandoPartidos = false;
        state.partidos = action.payload || [];
      })
      .addCase(fetchPartidos.rejected, (state, action) => {
        state.cargandoPartidos = false;
        state.error = action.payload;
      })
      // Ranking
      .addCase(fetchRanking.pending, (state) => {
        state.cargandoRanking = true;
      })
      .addCase(fetchRanking.fulfilled, (state, action) => {
        state.cargandoRanking = false;
        state.ranking = action.payload || [];
      })
      .addCase(fetchRanking.rejected, (state) => {
        state.cargandoRanking = false;
      })
      // Participante por alias (prefill público)
      .addCase(fetchParticipante.pending, (state) => {
        state.cargandoMis = true;
      })
      .addCase(fetchParticipante.fulfilled, (state, action) => {
        state.cargandoMis = false;
        aplicarParticipante(state, action.payload, { conservarClave: true });
      })
      .addCase(fetchParticipante.rejected, (state) => {
        // Alias inexistente: es un jugador nuevo, no es un error visible.
        state.cargandoMis = false;
      })
      // Mi participante (usuario logueado)
      .addCase(fetchMiParticipante.fulfilled, (state, action) => {
        if (action.payload && action.payload.alias) {
          aplicarParticipante(state, action.payload);
        }
      })
      // Guardar pronósticos
      .addCase(guardarPredicciones.pending, (state) => {
        state.guardando = true;
        state.error = null;
      })
      .addCase(guardarPredicciones.fulfilled, (state, action) => {
        state.guardando = false;
        aplicarParticipante(state, action.payload);
      })
      .addCase(guardarPredicciones.rejected, (state, action) => {
        state.guardando = false;
        state.error = action.payload;
      })
      // Cargar resultado (admin): actualiza el partido en memoria
      .addCase(cargarResultado.fulfilled, (state, action) => {
        const idx = state.partidos.findIndex((p) => p.idPartido === action.payload.idPartido);
        if (idx >= 0) {
          state.partidos[idx] = action.payload;
        }
      });
  },
});

export const {
  setMiAlias,
  setMiClave,
  setPrediccionLocal,
  limpiarProde,
  limpiarErrorProde,
} = prodeSlice.actions;

export default prodeSlice.reducer;
