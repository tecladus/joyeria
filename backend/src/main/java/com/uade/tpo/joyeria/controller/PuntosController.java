package com.uade.tpo.joyeria.controller;

import com.uade.tpo.joyeria.dto.PuntosResponse;
import com.uade.tpo.joyeria.entity.Usuario;
import com.uade.tpo.joyeria.service.PuntosService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Saldo e historial de puntos del usuario autenticado.
@RestController
@RequestMapping("/api/puntos")
public class PuntosController {

    private final PuntosService puntosService;

    public PuntosController(PuntosService puntosService) {
        this.puntosService = puntosService;
    }

    @GetMapping
    public ResponseEntity<PuntosResponse> miSaldo(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(puntosService.obtenerSaldo(usuario.getIdUsuario()));
    }
}
