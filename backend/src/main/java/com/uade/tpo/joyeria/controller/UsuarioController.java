package com.uade.tpo.joyeria.controller;

import com.uade.tpo.joyeria.dto.AuthResponse;
import com.uade.tpo.joyeria.dto.LoginRequest;
import com.uade.tpo.joyeria.dto.RegistroRequest;
import com.uade.tpo.joyeria.dto.UsuarioResponse;
import com.uade.tpo.joyeria.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Unicos endpoints publicos del sistema: el cliente obtiene su token JWT aqui.
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/registro")
    public ResponseEntity<AuthResponse> registrar(@Valid @RequestBody RegistroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.registrar(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(usuarioService.login(request));
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @PutMapping("/{id}/rol")
    public ResponseEntity<UsuarioResponse> cambiarRol(@PathVariable Long id, @RequestParam Long nuevoRolId) {
        return ResponseEntity.ok(usuarioService.cambiarRol(id, nuevoRolId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminarUsuario(id);
        return ResponseEntity.noContent().build();
    }
}
