import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchPartidos,
  fetchRanking,
  fetchParticipante,
  fetchMiParticipante,
  guardarPredicciones,
  cargarResultado,
  setMiAlias,
  setMiClave,
  setPrediccionLocal,
} from '../redux/slices/prodeSlice';

// ── Helpers de presentación ───────────────────────────────────────────────────

// Bandera vía flagcdn. Si el código falla, se oculta la imagen sin romper la fila.
function Bandera({ codigo, nombre, size = 30 }) {
  if (!codigo) return null;
  return (
    <img
      src={`https://flagcdn.com/w40/${codigo}.png`}
      srcSet={`https://flagcdn.com/w80/${codigo}.png 2x`}
      alt={nombre}
      title={nombre}
      loading="lazy"
      className="rounded-[2px] object-cover shadow-sm shrink-0 ring-1 ring-black/5"
      style={{ width: size, height: Math.round(size * 0.7) }}
      onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
    />
  );
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function formatearFecha(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const dia = d.getDate();
  const mes = MESES[d.getMonth()];
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dia} ${mes} · ${hora}:${min}`;
}

function Prode() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const {
    partidos,
    ranking,
    miAlias,
    miClave,
    usuarioVinculado,
    misPredicciones,
    miPuntaje,
    cargandoPartidos,
    guardando,
  } = useSelector((state) => state.prode);

  const esAdmin = auth.rol === 'ADMIN' || auth.rol === 'MODERATOR';
  const estaLogueado = !!auth.token;

  const [tab, setTab] = useState('pronosticos');
  const [grupoFiltro, setGrupoFiltro] = useState('Todos');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [adminAbierto, setAdminAbierto] = useState(null);
  const [resultadoInputs, setResultadoInputs] = useState({});
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  // Carga inicial.
  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchPartidos());
    dispatch(fetchRanking());
  }, [dispatch]);

  // Si está logueado, recupera su participante (con clave). Si no, prellena alias con su nombre.
  useEffect(() => {
    if (estaLogueado) {
      dispatch(fetchMiParticipante());
      if (!miAlias && auth.nombre) dispatch(setMiAlias(auth.nombre));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estaLogueado, auth.nombre]);

  // Carga los pronósticos guardados del alias persistido (jugador anónimo que regresa).
  useEffect(() => {
    if (miAlias && !estaLogueado) {
      dispatch(fetchParticipante(miAlias));
    }
    // Solo al montar / cambiar de sesión.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-cerrar notificaciones.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(''), 6000);
    return () => clearTimeout(t);
  }, [error]);

  const partidosPorId = useMemo(() => {
    const m = {};
    partidos.forEach((p) => { m[p.idPartido] = p; });
    return m;
  }, [partidos]);

  const grupos = useMemo(() => {
    const set = new Set(partidos.map((p) => p.grupo).filter(Boolean));
    return Array.from(set).sort();
  }, [partidos]);

  const partidosPorGrupo = useMemo(() => {
    const m = {};
    partidos.forEach((p) => {
      const g = p.grupo || '—';
      if (!m[g]) m[g] = [];
      m[g].push(p);
    });
    Object.values(m).forEach((lista) =>
      lista.sort((a, b) => (a.jornada - b.jornada) || (new Date(a.fechaPartido) - new Date(b.fechaPartido)) || (a.idPartido - b.idPartido))
    );
    return m;
  }, [partidos]);

  const gruposVisibles = grupoFiltro === 'Todos' ? grupos : grupos.filter((g) => g === grupoFiltro);

  const estaBloqueado = (partido) => {
    if (partido.finalizado) return true;
    if (!partido.fechaPartido) return false;
    return new Date(partido.fechaPartido) < new Date();
  };

  // ── Manejo de inputs de pronóstico ──────────────────────────────────────────
  const onScore = (partidoId, lado, valor) => {
    let limpio = '';
    if (valor !== '') {
      const n = parseInt(valor, 10);
      limpio = isNaN(n) ? '' : Math.max(0, Math.min(99, n));
    }
    const actual = misPredicciones[partidoId] || {};
    dispatch(setPrediccionLocal({
      partidoId,
      golesLocal: lado === 'local' ? limpio : (actual.golesLocal ?? ''),
      golesVisitante: lado === 'visitante' ? limpio : (actual.golesVisitante ?? ''),
    }));
  };

  const cantidadCompletos = useMemo(() => {
    return Object.entries(misPredicciones).filter(([id, p]) => {
      const partido = partidosPorId[id];
      return partido && !estaBloqueado(partido)
        && Number.isInteger(p.golesLocal) && Number.isInteger(p.golesVisitante);
    }).length;
  }, [misPredicciones, partidosPorId]);

  const handleGuardar = async () => {
    const alias = (miAlias || '').trim();
    if (alias.length < 3) {
      setError('Elegí un alias de al menos 3 caracteres para guardar tus pronósticos.');
      return;
    }
    const predicciones = Object.entries(misPredicciones)
      .filter(([id, p]) => {
        const partido = partidosPorId[id];
        return partido && !estaBloqueado(partido)
          && Number.isInteger(p.golesLocal) && Number.isInteger(p.golesVisitante);
      })
      .map(([id, p]) => ({ partidoId: Number(id), golesLocal: p.golesLocal, golesVisitante: p.golesVisitante }));

    if (predicciones.length === 0) {
      setError('Completá el marcador de al menos un partido que todavía no haya empezado.');
      return;
    }

    try {
      await dispatch(guardarPredicciones({ alias, claveEdicion: miClave, predicciones })).unwrap();
      setToast('¡Pronósticos guardados! Mucha suerte 🍀');
      dispatch(fetchRanking());
    } catch (e) {
      const msg = typeof e === 'string' ? e : (e?.message || 'No se pudieron guardar los pronósticos.');
      setError(msg);
      // Alias ocupado: mostramos el campo de clave para que pueda recuperar su prode.
      if (/alias/i.test(msg) && /clave/i.test(msg)) setMostrarClave(true);
    }
  };

  // ── Admin: cargar resultado real ─────────────────────────────────────────────
  const onResultadoInput = (partidoId, lado, valor) => {
    let limpio = '';
    if (valor !== '') {
      const n = parseInt(valor, 10);
      limpio = isNaN(n) ? '' : Math.max(0, Math.min(99, n));
    }
    setResultadoInputs((prev) => ({
      ...prev,
      [partidoId]: { ...prev[partidoId], [lado]: limpio },
    }));
  };

  const abrirAdmin = (partido) => {
    setAdminAbierto(adminAbierto === partido.idPartido ? null : partido.idPartido);
    setResultadoInputs((prev) => ({
      ...prev,
      [partido.idPartido]: {
        gl: partido.golesLocal ?? '',
        gv: partido.golesVisitante ?? '',
      },
    }));
  };

  const handleCargarResultado = async (partidoId) => {
    const r = resultadoInputs[partidoId] || {};
    if (!Number.isInteger(r.gl) || !Number.isInteger(r.gv)) {
      setError('Ingresá ambos marcadores del resultado real.');
      return;
    }
    try {
      await dispatch(cargarResultado({ partidoId, golesLocal: r.gl, golesVisitante: r.gv })).unwrap();
      setAdminAbierto(null);
      setToast('Resultado cargado. Puntajes recalculados.');
      dispatch(fetchRanking());
      if (miAlias) dispatch(fetchParticipante(miAlias));
    } catch (e) {
      setError(typeof e === 'string' ? e : (e?.message || 'No se pudo cargar el resultado.'));
    }
  };

  // ── Render de una fila de partido ─────────────────────────────────────────────
  const renderPartido = (partido) => {
    const bloqueado = estaBloqueado(partido);
    const pred = misPredicciones[partido.idPartido];
    const finalizado = partido.finalizado;
    const adminEditando = adminAbierto === partido.idPartido;

    // Puntos obtenidos en este partido (si ya finalizó y hay pronóstico).
    let puntos = null;
    if (finalizado && pred && Number.isInteger(pred.golesLocal) && Number.isInteger(pred.golesVisitante)) {
      puntos = pred.puntos ?? 0;
    }

    return (
      <div
        key={partido.idPartido}
        className="px-4 sm:px-5 py-3.5 border-b border-outline-variant/10 last:border-b-0"
      >
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="font-label-caps text-[10px] tracking-widest text-outline uppercase">
            {partido.fechaPartido ? formatearFecha(partido.fechaPartido) : `Jornada ${partido.jornada || ''}`}
            {partido.sede ? ` · ${partido.sede}` : ''}
          </span>
          {finalizado ? (
            <span className="font-label-caps text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">check_circle</span>Final
            </span>
          ) : bloqueado ? (
            <span className="font-label-caps text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-full bg-surface-container text-outline flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">lock</span>Cerrado
            </span>
          ) : (
            <span className="font-label-caps text-[9px] tracking-widest uppercase px-2 py-0.5 rounded-full bg-secondary-container/60 text-on-secondary-container">
              Abierto
            </span>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
          {/* Local */}
          <div className="flex items-center justify-end gap-2 min-w-0">
            <span className="font-body-md text-sm text-on-surface truncate text-right">{partido.equipoLocal}</span>
            <Bandera codigo={partido.codigoLocal} nombre={partido.equipoLocal} />
          </div>

          {/* Marcador / inputs */}
          <div className="flex items-center justify-center gap-1.5">
            {bloqueado ? (
              <div className="flex flex-col items-center">
                {finalizado ? (
                  <span className="font-headline-md text-xl text-on-surface tabular-nums leading-none">
                    {partido.golesLocal} <span className="text-outline">-</span> {partido.golesVisitante}
                  </span>
                ) : (
                  <span className="font-headline-md text-base text-outline tabular-nums leading-none">— : —</span>
                )}
              </div>
            ) : (
              <>
                <input
                  type="number" inputMode="numeric" min="0" max="99"
                  value={pred?.golesLocal ?? ''}
                  onChange={(e) => onScore(partido.idPartido, 'local', e.target.value)}
                  className="w-11 h-11 text-center font-headline-md text-lg bg-surface-container-low border border-outline-variant/30 rounded-lg text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors tabular-nums"
                  placeholder="-"
                  aria-label={`Goles ${partido.equipoLocal}`}
                />
                <span className="text-outline font-light">:</span>
                <input
                  type="number" inputMode="numeric" min="0" max="99"
                  value={pred?.golesVisitante ?? ''}
                  onChange={(e) => onScore(partido.idPartido, 'visitante', e.target.value)}
                  className="w-11 h-11 text-center font-headline-md text-lg bg-surface-container-low border border-outline-variant/30 rounded-lg text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors tabular-nums"
                  placeholder="-"
                  aria-label={`Goles ${partido.equipoVisitante}`}
                />
              </>
            )}
          </div>

          {/* Visitante */}
          <div className="flex items-center justify-start gap-2 min-w-0">
            <Bandera codigo={partido.codigoVisitante} nombre={partido.equipoVisitante} />
            <span className="font-body-md text-sm text-on-surface truncate">{partido.equipoVisitante}</span>
          </div>
        </div>

        {/* Pronóstico del usuario + puntos en partidos cerrados */}
        {bloqueado && pred && Number.isInteger(pred.golesLocal) && Number.isInteger(pred.golesVisitante) && (
          <div className="mt-2 flex items-center justify-center gap-2 text-center">
            <span className="font-label-caps text-[10px] tracking-wider uppercase text-outline">
              Tu pronóstico: {pred.golesLocal}-{pred.golesVisitante}
            </span>
            {puntos !== null && (
              <span className={`font-label-caps text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full ${
                puntos === 3 ? 'bg-primary text-on-primary' : puntos === 1 ? 'bg-primary/15 text-primary' : 'bg-surface-container text-outline'
              }`}>
                {puntos === 3 ? '¡Exacto! +3' : puntos === 1 ? 'Resultado +1' : '+0'}
              </span>
            )}
          </div>
        )}

        {/* Control de admin para cargar el resultado */}
        {esAdmin && (
          <div className="mt-2.5 flex flex-col items-center">
            <button
              onClick={() => abrirAdmin(partido)}
              className="font-label-caps text-[10px] tracking-widest uppercase text-primary hover:text-on-surface transition-colors flex items-center gap-1 bg-transparent border-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">tune</span>
              {finalizado ? 'Editar resultado' : 'Cargar resultado'}
            </button>
            {adminEditando && (
              <div className="mt-2 flex items-center gap-2 animate-fade-in bg-surface-container-low border border-outline-variant/20 rounded-xl px-3 py-2">
                <input
                  type="number" min="0" max="99"
                  value={resultadoInputs[partido.idPartido]?.gl ?? ''}
                  onChange={(e) => onResultadoInput(partido.idPartido, 'gl', e.target.value)}
                  className="w-10 h-9 text-center bg-background border border-outline-variant/40 rounded text-on-surface focus:border-primary focus:outline-none tabular-nums"
                />
                <span className="text-outline">:</span>
                <input
                  type="number" min="0" max="99"
                  value={resultadoInputs[partido.idPartido]?.gv ?? ''}
                  onChange={(e) => onResultadoInput(partido.idPartido, 'gv', e.target.value)}
                  className="w-10 h-9 text-center bg-background border border-outline-variant/40 rounded text-on-surface focus:border-primary focus:outline-none tabular-nums"
                />
                <button
                  onClick={() => handleCargarResultado(partido.idPartido)}
                  className="ml-1 px-3 h-9 bg-on-surface text-background font-label-caps text-[10px] tracking-widest uppercase rounded hover:bg-primary hover:text-on-primary transition-colors cursor-pointer border-0"
                >
                  Guardar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const miPosicion = useMemo(() => {
    if (!miAlias) return null;
    return ranking.find((r) => (r.alias || '').toLowerCase() === miAlias.toLowerCase()) || null;
  }, [ranking, miAlias]);

  return (
    <div className="min-h-screen pb-40 pt-28 sm:pt-32 bg-background text-on-surface">
      <main className="max-w-container-max mx-auto px-5 md:px-margin-desktop">

        {/* Encabezado */}
        <section className="mb-8 border-b border-outline-variant/10 pb-8 text-center">
          <span className="font-label-caps text-[11px] tracking-[0.25em] uppercase text-primary flex items-center justify-center gap-2 mb-3">
            <span className="material-symbols-outlined text-base">sports_soccer</span>
            Aura · Prode Mundial 2026
          </span>
          <h1 className="font-display-lg text-4xl md:text-6xl text-on-background mb-4 tracking-tight">
            El Prode del Mundial
          </h1>
          <p className="font-body-lg text-secondary font-light max-w-2xl mx-auto">
            Pronosticá los marcadores, sumá puntos y competí por la cima del ranking.
            Resultado exacto <strong className="text-primary font-medium">+3</strong>,
            acertar el ganador o empate <strong className="text-primary font-medium">+1</strong>.
          </p>
        </section>

        {/* Notificaciones */}
        {toast && (
          <div className="bg-primary/10 border border-primary/30 text-primary p-4 rounded-xl mb-6 font-body-md text-sm flex justify-between items-center animate-fade-in">
            <span>{toast}</span>
            <button onClick={() => setToast('')} className="bg-transparent border-0 text-primary cursor-pointer font-bold pl-2">✕</button>
          </div>
        )}
        {error && (
          <div className="bg-error-container border border-error/40 text-on-error-container p-4 rounded-xl mb-6 font-body-md text-sm flex justify-between items-center animate-fade-in">
            <span>{error}</span>
            <button onClick={() => setError('')} className="bg-transparent border-0 text-on-error-container cursor-pointer font-bold pl-2">✕</button>
          </div>
        )}

        {/* Identidad del jugador */}
        <section className="mb-8 bg-surface-container-low border border-outline-variant/15 rounded-2xl p-5 sm:p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <label className="font-label-caps text-[10px] tracking-widest uppercase text-outline block mb-1.5">
                Tu alias en el ranking
              </label>
              <input
                type="text"
                value={miAlias}
                maxLength={40}
                onChange={(e) => dispatch(setMiAlias(e.target.value))}
                placeholder="Ej: Lionel10"
                className="w-full bg-background border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface font-body-md focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
              />
            </div>
            {miPuntaje && (
              <div className="flex items-center gap-5 sm:pb-1">
                <div className="text-center">
                  <span className="font-display-lg text-3xl text-primary leading-none tabular-nums">{miPuntaje.puntosTotal ?? 0}</span>
                  <span className="font-label-caps text-[9px] tracking-widest uppercase text-outline block mt-1">Puntos</span>
                </div>
                <div className="text-center">
                  <span className="font-display-lg text-3xl text-on-surface leading-none tabular-nums">{miPuntaje.exactos ?? 0}</span>
                  <span className="font-label-caps text-[9px] tracking-widest uppercase text-outline block mt-1">Exactos</span>
                </div>
                {miPosicion && (
                  <div className="text-center">
                    <span className="font-display-lg text-3xl text-on-surface leading-none tabular-nums">#{miPosicion.posicion}</span>
                    <span className="font-label-caps text-[9px] tracking-widest uppercase text-outline block mt-1">Posición</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Clave de edición */}
          {!usuarioVinculado && (
            <div className="mt-4">
              {!mostrarClave ? (
                <button
                  onClick={() => setMostrarClave(true)}
                  className="font-label-caps text-[10px] tracking-widest uppercase text-primary hover:text-on-surface transition-colors bg-transparent border-0 cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">key</span>
                  ¿Ya jugaste? Ingresá tu clave de edición
                </button>
              ) : (
                <div className="animate-fade-in">
                  <label className="font-label-caps text-[10px] tracking-widest uppercase text-outline block mb-1.5">
                    Clave de edición
                  </label>
                  <input
                    type="text"
                    value={miClave}
                    onChange={(e) => dispatch(setMiClave(e.target.value))}
                    placeholder="Pegá aquí tu clave para recuperar tus pronósticos"
                    className="w-full bg-background border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm text-on-surface font-body-md focus:border-primary focus:outline-none transition-colors"
                  />
                  <p className="font-body-md text-xs text-outline mt-2 leading-relaxed">
                    {miClave
                      ? 'Guardá esta clave: te permite editar tus pronósticos desde cualquier dispositivo. '
                      : 'Si es tu primera vez, dejá este campo vacío: al guardar se generará tu clave automáticamente. '}
                    {estaLogueado ? '' : 'Iniciá sesión para no depender de la clave.'}
                  </p>
                </div>
              )}
            </div>
          )}
          {usuarioVinculado && (
            <p className="font-body-md text-xs text-outline mt-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-primary">verified</span>
              Tu prode está vinculado a tu cuenta. Podés editarlo desde cualquier dispositivo.
            </p>
          )}
        </section>

        {/* Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setTab('pronosticos')}
            className={`font-label-caps text-[11px] tracking-widest uppercase px-5 py-2.5 rounded-full transition-all duration-300 border cursor-pointer flex items-center gap-2 ${
              tab === 'pronosticos'
                ? 'bg-on-surface text-background border-on-surface'
                : 'bg-transparent text-on-surface-variant border-outline-variant/30 hover:border-primary'
            }`}
          >
            <span className="material-symbols-outlined text-base">stadia_controller</span>
            Pronósticos
          </button>
          <button
            onClick={() => setTab('ranking')}
            className={`font-label-caps text-[11px] tracking-widest uppercase px-5 py-2.5 rounded-full transition-all duration-300 border cursor-pointer flex items-center gap-2 ${
              tab === 'ranking'
                ? 'bg-on-surface text-background border-on-surface'
                : 'bg-transparent text-on-surface-variant border-outline-variant/30 hover:border-primary'
            }`}
          >
            <span className="material-symbols-outlined text-base">leaderboard</span>
            Ranking
          </button>
        </div>

        {/* ── Tab Pronósticos ── */}
        {tab === 'pronosticos' && (
          <section className="animate-fade-in">
            {cargandoPartidos && partidos.length === 0 ? (
              <div className="text-center py-20 text-outline font-body-md">Cargando fixture…</div>
            ) : partidos.length === 0 ? (
              <div className="text-center py-20 text-outline font-body-md">Todavía no hay partidos cargados.</div>
            ) : (
              <>
                {/* Filtro por grupo */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  <button
                    onClick={() => setGrupoFiltro('Todos')}
                    className={`font-label-caps text-[10px] tracking-widest uppercase px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
                      grupoFiltro === 'Todos' ? 'bg-primary/15 border-primary text-primary' : 'border-outline-variant/30 text-on-surface-variant hover:border-primary'
                    }`}
                  >
                    Todos
                  </button>
                  {grupos.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGrupoFiltro(g)}
                      className={`font-label-caps text-[10px] tracking-widest uppercase px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
                        grupoFiltro === g ? 'bg-primary/15 border-primary text-primary' : 'border-outline-variant/30 text-on-surface-variant hover:border-primary'
                      }`}
                    >
                      Grupo {g}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {gruposVisibles.map((g) => (
                    <div key={g} className="bg-background border border-outline-variant/15 rounded-2xl overflow-hidden ambient-shadow">
                      <div className="bg-surface-container-low px-5 py-3.5 border-b border-outline-variant/15 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">groups</span>
                        <h3 className="font-headline-md text-lg text-on-surface">Grupo {g}</h3>
                      </div>
                      <div>
                        {partidosPorGrupo[g]?.map((partido) => renderPartido(partido))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* ── Tab Ranking ── */}
        {tab === 'ranking' && (
          <section className="animate-fade-in max-w-3xl mx-auto">
            {ranking.length === 0 ? (
              <div className="text-center py-20 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant/30">
                <span className="material-symbols-outlined text-4xl text-outline-variant mb-4 block">emoji_events</span>
                <h3 className="font-display-lg text-2xl mb-2 text-on-surface">El ranking está esperando</h3>
                <p className="font-body-md text-secondary max-w-sm mx-auto">
                  Sé el primero en cargar tus pronósticos y aparecer aquí.
                </p>
              </div>
            ) : (
              <div className="bg-background border border-outline-variant/15 rounded-2xl overflow-hidden ambient-shadow">
                <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 px-5 py-3 bg-surface-container-low border-b border-outline-variant/15 font-label-caps text-[9px] tracking-widest uppercase text-outline">
                  <span className="w-8 text-center">#</span>
                  <span>Jugador</span>
                  <span className="w-10 text-center">PJ</span>
                  <span className="w-12 text-center">Exac.</span>
                  <span className="w-14 text-right">Puntos</span>
                </div>
                {ranking.map((r) => {
                  const esMio = miAlias && (r.alias || '').toLowerCase() === miAlias.toLowerCase();
                  const medalla = r.posicion === 1 ? '🥇' : r.posicion === 2 ? '🥈' : r.posicion === 3 ? '🥉' : null;
                  return (
                    <div
                      key={`${r.alias}-${r.posicion}`}
                      className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-3 px-5 py-3.5 border-b border-outline-variant/10 last:border-b-0 items-center transition-colors ${
                        esMio ? 'bg-primary/10' : 'hover:bg-surface-container-low/50'
                      }`}
                    >
                      <span className="w-8 text-center font-headline-md text-base tabular-nums text-on-surface">
                        {medalla || r.posicion}
                      </span>
                      <span className={`font-body-md text-sm truncate ${esMio ? 'text-primary font-semibold' : 'text-on-surface'}`}>
                        {r.alias}{esMio && <span className="font-label-caps text-[9px] tracking-widest uppercase text-primary ml-2">· Vos</span>}
                      </span>
                      <span className="w-10 text-center font-body-md text-sm text-outline tabular-nums">{r.jugados}</span>
                      <span className="w-12 text-center font-body-md text-sm text-on-surface-variant tabular-nums">{r.exactos}</span>
                      <span className="w-14 text-right font-headline-md text-lg text-primary tabular-nums">{r.puntos}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Barra fija de guardado (solo en pronósticos) */}
      {tab === 'pronosticos' && partidos.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full z-40 bg-background/95 backdrop-blur border-t border-outline-variant/15 ambient-shadow">
          <div className="max-w-container-max mx-auto px-5 md:px-margin-desktop py-3.5 flex items-center justify-between gap-4">
            <span className="font-label-caps text-[10px] sm:text-[11px] tracking-wider uppercase text-on-surface-variant">
              {cantidadCompletos > 0
                ? `${cantidadCompletos} ${cantidadCompletos === 1 ? 'partido completo' : 'partidos completos'} para guardar`
                : 'Completá los marcadores y guardá'}
            </span>
            <button
              onClick={handleGuardar}
              disabled={guardando}
              className="px-7 py-3 bg-on-surface text-background font-label-caps text-[11px] tracking-widest uppercase rounded-full hover:bg-primary hover:text-on-primary transition-colors duration-300 cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {guardando ? 'Guardando…' : (
                <>
                  <span className="material-symbols-outlined text-base">save</span>
                  Guardar pronósticos
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Prode;
