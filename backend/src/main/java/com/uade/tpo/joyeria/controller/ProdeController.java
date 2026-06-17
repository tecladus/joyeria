package com.uade.tpo.joyeria.controller;

import com.uade.tpo.joyeria.dto.GuardarPrediccionesRequest;
import com.uade.tpo.joyeria.dto.ParticipanteResponse;
import com.uade.tpo.joyeria.dto.PartidoResponse;
import com.uade.tpo.joyeria.dto.RankingEntryResponse;
import com.uade.tpo.joyeria.dto.ResultadoRequest;
import com.uade.tpo.joyeria.entity.Usuario;
import com.uade.tpo.joyeria.service.ProdeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Endpoints del prode del Mundial.
// Públicos: listar partidos, ranking, ver pronósticos de un alias y guardar pronósticos.
// El guardado funciona con o sin sesión (el usuario logueado se detecta del token).
// La carga de resultados queda restringida a ADMIN/MODERATOR en SecurityConfig.
@RestController
@RequestMapping("/api/prode")
public class ProdeController {

    private final ProdeService prodeService;

    public ProdeController(ProdeService prodeService) {
        this.prodeService = prodeService;
    }

    @GetMapping("/partidos")
    public ResponseEntity<List<PartidoResponse>> listarPartidos() {
        return ResponseEntity.ok(prodeService.listarPartidos());
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<RankingEntryResponse>> ranking() {
        return ResponseEntity.ok(prodeService.obtenerRanking());
    }

    @GetMapping("/participantes/{alias}")
    public ResponseEntity<ParticipanteResponse> obtenerParticipante(@PathVariable String alias) {
        return ResponseEntity.ok(prodeService.obtenerParticipantePorAlias(alias));
    }

    // Recupera el participante del usuario logueado (con su clave de edición). 204 si aún no juega.
    @GetMapping("/mi-participante")
    public ResponseEntity<ParticipanteResponse> miParticipante(@AuthenticationPrincipal Usuario usuario) {
        ParticipanteResponse participante = prodeService.obtenerMiParticipante(usuario);
        return participante == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(participante);
    }

    @PostMapping("/predicciones")
    public ResponseEntity<ParticipanteResponse> guardarPredicciones(
            @AuthenticationPrincipal Usuario usuario,
            @Valid @RequestBody GuardarPrediccionesRequest request) {
        return ResponseEntity.ok(prodeService.guardarPredicciones(request, usuario));
    }

    @PutMapping("/partidos/{id}/resultado")
    public ResponseEntity<PartidoResponse> cargarResultado(@PathVariable Long id,
                                                           @Valid @RequestBody ResultadoRequest request) {
        return ResponseEntity.ok(prodeService.cargarResultado(id, request));
    }
}
