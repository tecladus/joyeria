package com.uade.tpo.joyeria.controller;

import com.uade.tpo.joyeria.dto.AuthResponse;
import com.uade.tpo.joyeria.dto.LoginRequest;
import com.uade.tpo.joyeria.dto.RegistroRequest;
import com.uade.tpo.joyeria.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

// Unicos endpoints publicos del sistema: el cliente obtiene su token JWT aqui.
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;

    public UsuarioController(UsuarioService usuarioService, PasswordEncoder passwordEncoder) {
        this.usuarioService = usuarioService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/registro")
    public ResponseEntity<AuthResponse> registrar(@Valid @RequestBody RegistroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.registrar(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(usuarioService.login(request));
    }

    // Endpoint temporal para generar hashes BCrypt de contraseñas (solo desarrollo)
    @PostMapping("/debug/hash")
    public ResponseEntity<Map<String, String>> generarHash(@RequestBody Map<String, String> request) {
        String password = request.get("password");
        if (password == null || password.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Password requerido"));
        }
        String hash = passwordEncoder.encode(password);
        return ResponseEntity.ok(Map.of(
            "password", password,
            "hash", hash,
            "verificacion", String.valueOf(passwordEncoder.matches(password, hash))
        ));
    }
}
