package com.uade.tpo.joyeria.controller;

import com.uade.tpo.joyeria.dto.CuponRequest;
import com.uade.tpo.joyeria.dto.CuponResponse;
import com.uade.tpo.joyeria.service.CuponService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Cupones de embajador. El comprador solo puede validar un codigo; el Admin gestiona el catalogo.
@RestController
@RequestMapping("/api/cupones")
public class CuponController {

    private final CuponService cuponService;

    public CuponController(CuponService cuponService) {
        this.cuponService = cuponService;
    }

    // Previsualizar un cupon desde el carrito (cualquier usuario autenticado).
    @GetMapping("/validar")
    public ResponseEntity<CuponResponse> validar(@RequestParam String codigo) {
        return ResponseEntity.ok(cuponService.validarResponse(codigo));
    }

    // ── Gestion (Admin) ──────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<CuponResponse>> listar() {
        return ResponseEntity.ok(cuponService.listar());
    }

    @PostMapping
    public ResponseEntity<CuponResponse> crear(@Valid @RequestBody CuponRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cuponService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CuponResponse> actualizar(@PathVariable Long id,
                                                    @Valid @RequestBody CuponRequest request) {
        return ResponseEntity.ok(cuponService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        cuponService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
