package com.uade.tpo.joyeria.controller;

import com.uade.tpo.joyeria.dto.OrdenResponse;
import com.uade.tpo.joyeria.entity.Usuario;
import com.uade.tpo.joyeria.service.OrdenService;
import com.uade.tpo.joyeria.dto.CheckoutRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Endpoints de ordenes. Solo accesible para COMPRADOR.
@RestController
@RequestMapping("/api/ordenes")
public class OrdenController {

    private final OrdenService ordenService;

    public OrdenController(OrdenService ordenService) {
        this.ordenService = ordenService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<OrdenResponse> checkout(@AuthenticationPrincipal Usuario usuario,
                                                  @Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ordenService.checkout(usuario.getIdUsuario(), request));
    }

    @PostMapping("/checkout/preferencia")
    public ResponseEntity<java.util.Map<String, String>> checkoutPreferencia(@AuthenticationPrincipal Usuario usuario,
                                                                             @Valid @RequestBody CheckoutRequest request) {
        String initPoint = ordenService.checkoutMercadoPago(usuario.getIdUsuario(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(java.util.Map.of("initPoint", initPoint));
    }

    @PostMapping("/{id}/confirmar-pago")
    public ResponseEntity<OrdenResponse> confirmarPago(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(ordenService.confirmarPagoOrden(id, status));
    }

    @PostMapping("/notificacion-pago")
    public ResponseEntity<Void> recibirNotificacionPago(@RequestBody(required = false) java.util.Map<String, Object> payload) {
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<OrdenResponse>> listar(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(ordenService.listarPorUsuario(usuario.getIdUsuario()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdenResponse> obtener(@PathVariable Long id,
                                                  @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(ordenService.obtenerPorId(id, usuario.getIdUsuario(), usuario.getRol().getNombre()));
    }

    @GetMapping("/todas")
    public ResponseEntity<List<OrdenResponse>> listarTodas() {
        return ResponseEntity.ok(ordenService.listarTodas());
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<OrdenResponse> actualizarEstado(@PathVariable Long id, @RequestParam String estado) {
        return ResponseEntity.ok(ordenService.actualizarEstado(id, estado));
    }
}
