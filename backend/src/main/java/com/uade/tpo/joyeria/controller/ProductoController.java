package com.uade.tpo.joyeria.controller;

import com.uade.tpo.joyeria.dto.ProductoRequest;
import com.uade.tpo.joyeria.dto.ProductoResponse;
import com.uade.tpo.joyeria.entity.Usuario;
import com.uade.tpo.joyeria.service.ProductoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

// Endpoints de productos. GET para cualquier autenticado, escritura solo VENDEDOR.
// El vendedorId viene del token JWT, no del body, para evitar que se falsifique.
@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public ResponseEntity<List<ProductoResponse>> listar() {
        return ResponseEntity.ok(productoService.listarDisponibles());
    }

    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<List<ProductoResponse>> listarPorCategoria(@PathVariable Long categoriaId) {
        return ResponseEntity.ok(productoService.listarPorCategoria(categoriaId));
    }

    @GetMapping("/precio")
    public ResponseEntity<List<ProductoResponse>> listarPorPrecio(@RequestParam BigDecimal min,
                                                                    @RequestParam BigDecimal max) {
        return ResponseEntity.ok(productoService.listarPorRangoDePrecio(min, max));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<ProductoResponse> crear(@AuthenticationPrincipal Usuario usuario,
                                                   @Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productoService.crear(usuario.getIdUsuario(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoResponse> actualizar(@PathVariable Long id,
                                                        @AuthenticationPrincipal Usuario usuario,
                                                        @Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.ok(productoService.actualizar(usuario.getIdUsuario(), usuario.getRol().getNombre(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id,
                                          @AuthenticationPrincipal Usuario usuario) {
        productoService.eliminar(usuario.getIdUsuario(), usuario.getRol().getNombre(), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/descuento")
    public ResponseEntity<ProductoResponse> aplicarDescuento(@PathVariable Long id,
                                                              @AuthenticationPrincipal Usuario usuario,
                                                              @RequestParam BigDecimal descuento) {
        return ResponseEntity.ok(productoService.aplicarDescuento(usuario.getIdUsuario(), usuario.getRol().getNombre(), id, descuento));
    }
}
