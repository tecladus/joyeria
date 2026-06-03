package com.uade.tpo.joyeria.controller;

import com.uade.tpo.joyeria.dto.AuthResponse;
import com.uade.tpo.joyeria.dto.LoginRequest;
import com.uade.tpo.joyeria.dto.RegistroRequest;
import com.uade.tpo.joyeria.dto.UsuarioResponse;
import com.uade.tpo.joyeria.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.uade.tpo.joyeria.entity.Usuario;

import java.util.List;

// Unicos endpoints publicos del sistema: el cliente obtiene su token JWT aqui.
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final com.uade.tpo.joyeria.service.MailService mailService;

    public UsuarioController(UsuarioService usuarioService,
                             com.uade.tpo.joyeria.service.MailService mailService) {
        this.usuarioService = usuarioService;
        this.mailService = mailService;
    }

    @PostMapping("/test-email")
    public ResponseEntity<?> enviarEmailPrueba(@AuthenticationPrincipal Usuario usuario) {
        try {
            mailService.enviarCorreoPrueba(usuario.getEmail(), usuario.getNombre() + " " + usuario.getApellido());
            return ResponseEntity.ok(java.util.Map.of("message", "Email de prueba enviado exitosamente a " + usuario.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of("error", "Error al enviar el email: " + e.getMessage()));
        }
    }

    @PostMapping("/registro")
    public ResponseEntity<AuthResponse> registrar(@Valid @RequestBody RegistroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.registrar(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(usuarioService.login(request));
    }

    @PutMapping("/ser-vendedor")
    public ResponseEntity<AuthResponse> convertirseEnVendedor(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(usuarioService.convertirseEnVendedor(usuario.getIdUsuario()));
    }

    @GetMapping("/perfil")
    public ResponseEntity<UsuarioResponse> obtenerPerfil(@AuthenticationPrincipal Usuario usuario) {
        return ResponseEntity.ok(usuarioService.obtenerPerfil(usuario.getEmail()));
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
