package com.uade.tpo.joyeria.service;

import com.uade.tpo.joyeria.dto.*;
import com.uade.tpo.joyeria.entity.Participante;
import com.uade.tpo.joyeria.entity.Partido;
import com.uade.tpo.joyeria.entity.Prediccion;
import com.uade.tpo.joyeria.entity.Usuario;
import com.uade.tpo.joyeria.exception.AccesoDenegadoException;
import com.uade.tpo.joyeria.exception.RecursoNoEncontradoException;
import com.uade.tpo.joyeria.repository.ParticipanteRepository;
import com.uade.tpo.joyeria.repository.PartidoRepository;
import com.uade.tpo.joyeria.repository.PrediccionRepository;
import com.uade.tpo.joyeria.repository.RankingProjection;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

// Lógica del prode del Mundial: pronósticos, puntuación y ranking.
//
// Puntuación clásica de prode:
//   - Resultado exacto (mismo marcador): 3 puntos
//   - Acertar solo el ganador/empate (signo): 1 punto
//   - Errar: 0 puntos
//
// Las predicciones se "congelan" al iniciar el partido: ya no se pueden crear ni
// modificar pronósticos de un partido finalizado o cuya fecha de inicio ya pasó.
@Service
public class ProdeService {

    static final int PUNTOS_EXACTO = 3;
    static final int PUNTOS_RESULTADO = 1;

    private final PartidoRepository partidoRepository;
    private final ParticipanteRepository participanteRepository;
    private final PrediccionRepository prediccionRepository;

    public ProdeService(PartidoRepository partidoRepository,
                        ParticipanteRepository participanteRepository,
                        PrediccionRepository prediccionRepository) {
        this.partidoRepository = partidoRepository;
        this.participanteRepository = participanteRepository;
        this.prediccionRepository = prediccionRepository;
    }

    // ── Lectura ───────────────────────────────────────────────────────────────

    public List<PartidoResponse> listarPartidos() {
        return partidoRepository.findAllByOrderByFechaPartidoAscIdPartidoAsc().stream()
                .map(this::mapearPartido)
                .collect(Collectors.toList());
    }

    // Ranking ordenado: por puntos, luego resultados exactos, luego alias alfabético.
    public List<RankingEntryResponse> obtenerRanking() {
        List<RankingProjection> filas = prediccionRepository.obtenerRanking();

        List<RankingProjection> ordenadas = new ArrayList<>(filas);
        ordenadas.sort(
                Comparator.comparingLong((RankingProjection r) -> valor(r.getPuntos())).reversed()
                        .thenComparing(Comparator.comparingLong((RankingProjection r) -> valor(r.getExactos())).reversed())
                        .thenComparing(r -> r.getAlias() == null ? "" : r.getAlias().toLowerCase())
        );

        List<RankingEntryResponse> ranking = new ArrayList<>();
        int posicion = 1;
        for (RankingProjection r : ordenadas) {
            ranking.add(RankingEntryResponse.builder()
                    .posicion(posicion++)
                    .alias(r.getAlias())
                    .puntos((int) valor(r.getPuntos()))
                    .exactos((int) valor(r.getExactos()))
                    .jugados((int) valor(r.getJugados()))
                    .build());
        }
        return ranking;
    }

    // Lectura pública por alias: sin clave de edición. Devuelve 404 si no existe.
    public ParticipanteResponse obtenerParticipantePorAlias(String alias) {
        Participante participante = participanteRepository.findByAliasIgnoreCase(alias.trim())
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe un participante con ese alias"));
        return mapearParticipante(participante, false);
    }

    // El usuario logueado recupera su propio participante (con clave, para poder editar
    // desde este dispositivo). Devuelve null si todavía no juega.
    public ParticipanteResponse obtenerMiParticipante(Usuario usuario) {
        if (usuario == null) {
            return null;
        }
        return participanteRepository.findByUsuarioId(usuario.getIdUsuario())
                .map(p -> mapearParticipante(p, true))
                .orElse(null);
    }

    // ── Escritura de pronósticos ────────────────────────────────────────────────

    @Transactional
    public ParticipanteResponse guardarPredicciones(GuardarPrediccionesRequest request, Usuario usuario) {
        Participante participante = resolverParticipante(request, usuario);

        // Cachear los partidos para no consultarlos repetidamente.
        Map<Long, Partido> partidos = partidoRepository.findAll().stream()
                .collect(Collectors.toMap(Partido::getIdPartido, p -> p));

        LocalDateTime ahora = LocalDateTime.now();

        for (PrediccionItemRequest item : request.getPredicciones()) {
            Partido partido = partidos.get(item.getPartidoId());
            if (partido == null) {
                throw new RecursoNoEncontradoException("Partido no encontrado: " + item.getPartidoId());
            }
            // Partido ya iniciado o finalizado: no se acepta crear ni modificar su pronóstico.
            if (estaCerrado(partido, ahora)) {
                continue;
            }

            Prediccion prediccion = prediccionRepository
                    .findByParticipante_IdParticipanteAndPartido_IdPartido(
                            participante.getIdParticipante(), partido.getIdPartido())
                    .orElseGet(() -> {
                        Prediccion nueva = new Prediccion();
                        nueva.setParticipante(participante);
                        nueva.setPartido(partido);
                        return nueva;
                    });

            prediccion.setGolesLocal(item.getGolesLocal());
            prediccion.setGolesVisitante(item.getGolesVisitante());
            prediccion.setPuntos(calcularPuntos(partido, item.getGolesLocal(), item.getGolesVisitante()));
            prediccionRepository.save(prediccion);
        }

        return mapearParticipante(participante, true);
    }

    // ── Administración: cargar el resultado real ─────────────────────────────────

    @Transactional
    public PartidoResponse cargarResultado(Long partidoId, ResultadoRequest request) {
        Partido partido = partidoRepository.findById(partidoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Partido no encontrado: " + partidoId));

        partido.setGolesLocal(request.getGolesLocal());
        partido.setGolesVisitante(request.getGolesVisitante());
        partido.setFinalizado(true);
        partidoRepository.save(partido);

        // Re-puntuar todas las predicciones de este partido con el resultado definitivo.
        List<Prediccion> predicciones = prediccionRepository.findByPartido_IdPartido(partidoId);
        for (Prediccion prediccion : predicciones) {
            prediccion.setPuntos(calcularPuntos(partido, prediccion.getGolesLocal(), prediccion.getGolesVisitante()));
        }
        prediccionRepository.saveAll(predicciones);

        return mapearPartido(partido);
    }

    // ── Internos ─────────────────────────────────────────────────────────────────

    // Decide qué participante corresponde y valida los permisos de edición.
    private Participante resolverParticipante(GuardarPrediccionesRequest request, Usuario usuario) {
        String alias = request.getAlias().trim();
        Participante porAlias = participanteRepository.findByAliasIgnoreCase(alias).orElse(null);

        if (usuario != null) {
            Participante mio = participanteRepository.findByUsuarioId(usuario.getIdUsuario()).orElse(null);
            if (mio != null) {
                // El usuario ya juega: puede renombrarse mientras el alias no sea de otro.
                if (porAlias != null && !porAlias.getIdParticipante().equals(mio.getIdParticipante())) {
                    throw new AccesoDenegadoException("Ese alias ya está en uso por otra persona. Elegí otro.");
                }
                mio.setAlias(alias);
                return participanteRepository.save(mio);
            }
            // El usuario todavía no juega.
            if (porAlias != null) {
                if (porAlias.getUsuarioId() != null) {
                    throw new AccesoDenegadoException("Ese alias ya está en uso por otra persona. Elegí otro.");
                }
                // Alias anónimo: para reclamarlo hay que conocer su clave de edición.
                if (claveCoincide(request.getClaveEdicion(), porAlias)) {
                    porAlias.setUsuarioId(usuario.getIdUsuario());
                    return participanteRepository.save(porAlias);
                }
                throw new AccesoDenegadoException(
                        "Ese alias ya existe. Ingresá su clave de edición para vincularlo, o elegí otro.");
            }
            return crearParticipante(alias, usuario.getIdUsuario());
        }

        // Anónimo.
        if (porAlias != null) {
            if (claveCoincide(request.getClaveEdicion(), porAlias)) {
                return porAlias;
            }
            throw new AccesoDenegadoException(
                    "Ese alias ya existe. Ingresá su clave de edición para modificar tus pronósticos, o elegí otro.");
        }
        return crearParticipante(alias, null);
    }

    private Participante crearParticipante(String alias, Long usuarioId) {
        Participante participante = new Participante();
        participante.setAlias(alias);
        participante.setClaveEdicion(UUID.randomUUID().toString());
        participante.setUsuarioId(usuarioId);
        participante.setFechaCreacion(LocalDateTime.now());
        return participanteRepository.save(participante);
    }

    private boolean claveCoincide(String clave, Participante participante) {
        return clave != null && !clave.isBlank() && clave.equals(participante.getClaveEdicion());
    }

    // Un partido está cerrado para pronósticos si ya finalizó o si su fecha de inicio pasó.
    private boolean estaCerrado(Partido partido, LocalDateTime ahora) {
        if (partido.isFinalizado()) {
            return true;
        }
        return partido.getFechaPartido() != null && partido.getFechaPartido().isBefore(ahora);
    }

    private int calcularPuntos(Partido partido, Integer golesLocalPred, Integer golesVisitantePred) {
        if (!partido.isFinalizado() || partido.getGolesLocal() == null || partido.getGolesVisitante() == null) {
            return 0;
        }
        if (golesLocalPred == null || golesVisitantePred == null) {
            return 0;
        }
        int realLocal = partido.getGolesLocal();
        int realVisitante = partido.getGolesVisitante();

        if (golesLocalPred == realLocal && golesVisitantePred == realVisitante) {
            return PUNTOS_EXACTO;
        }
        if (signo(golesLocalPred - golesVisitantePred) == signo(realLocal - realVisitante)) {
            return PUNTOS_RESULTADO;
        }
        return 0;
    }

    private int signo(int valor) {
        return Integer.compare(valor, 0);
    }

    private long valor(Long valor) {
        return valor == null ? 0L : valor;
    }

    // ── Mapeos a DTO ──────────────────────────────────────────────────────────────

    private PartidoResponse mapearPartido(Partido partido) {
        return PartidoResponse.builder()
                .idPartido(partido.getIdPartido())
                .fase(partido.getFase())
                .grupo(partido.getGrupo())
                .jornada(partido.getJornada())
                .equipoLocal(partido.getEquipoLocal())
                .equipoVisitante(partido.getEquipoVisitante())
                .codigoLocal(partido.getCodigoLocal())
                .codigoVisitante(partido.getCodigoVisitante())
                .fechaPartido(partido.getFechaPartido())
                .sede(partido.getSede())
                .golesLocal(partido.getGolesLocal())
                .golesVisitante(partido.getGolesVisitante())
                .finalizado(partido.isFinalizado())
                .build();
    }

    // incluirClave: solo true cuando el dueño guarda/recupera (para persistir el token).
    private ParticipanteResponse mapearParticipante(Participante participante, boolean incluirClave) {
        List<Prediccion> predicciones =
                prediccionRepository.findByParticipante_IdParticipante(participante.getIdParticipante());

        int total = predicciones.stream().mapToInt(p -> p.getPuntos() == null ? 0 : p.getPuntos()).sum();
        int exactos = (int) predicciones.stream().filter(p -> p.getPuntos() != null && p.getPuntos() == PUNTOS_EXACTO).count();

        List<PrediccionResponse> items = predicciones.stream()
                .map(p -> PrediccionResponse.builder()
                        .partidoId(p.getPartido().getIdPartido())
                        .golesLocal(p.getGolesLocal())
                        .golesVisitante(p.getGolesVisitante())
                        .puntos(p.getPuntos())
                        .build())
                .collect(Collectors.toList());

        return ParticipanteResponse.builder()
                .alias(participante.getAlias())
                .claveEdicion(incluirClave ? participante.getClaveEdicion() : null)
                .usuarioVinculado(participante.getUsuarioId() != null)
                .puntosTotal(total)
                .exactos(exactos)
                .predicciones(items)
                .build();
    }
}
