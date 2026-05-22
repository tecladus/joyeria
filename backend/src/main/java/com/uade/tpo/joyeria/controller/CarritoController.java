package com.uade.tpo.joyeria.controller;

import com.uade.tpo.joyeria.dto.CarritoResponse;
import com.uade.tpo.joyeria.dto.ItemCarritoRequest;
import com.uade.tpo.joyeria.entity.Usuario;
import com.uade.tpo.joyeria.service.CarritoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

// Endpoints del carrito. Solo accesible para COMPRADOR.
// @AuthenticationPrincipal inyecta el usuario del token para garantizar que cada uno ve solo su carrito.
@RestController
@RequestMapping("/api/carrito")
public class CarritoController {

    private final CarritoService carritoService;

    public CarritoController(CarritoService carritoService) {
        this.carritoService = carritoService;
    }

    @GetMapping
    public ResponseEntity<CarritoResponse> obtener(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(carritoService.obtenerCarrito(usuario.getIdUsuario()));
    }

    @PostMapping("/items")
    public ResponseEntity<CarritoResponse> agregarItem(@AuthenticationPrincipal Usuario usuario,
                                                        @Valid @RequestBody ItemCarritoRequest request) {
        return ResponseEntity.ok(carritoService.agregarItem(usuario.getIdUsuario(), request));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CarritoResponse> modificarItem(@PathVariable Long itemId,
                                                          @AuthenticationPrincipal Usuario usuario,
                                                          @RequestParam Integer cantidad) {
        return ResponseEntity.ok(carritoService.modificarItem(usuario.getIdUsuario(), itemId, cantidad));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CarritoResponse> eliminarItem(@PathVariable Long itemId,
                                                         @AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(carritoService.eliminarItem(usuario.getIdUsuario(), itemId));
    }
}
