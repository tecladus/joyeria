package com.uade.tpo.joyeria.dto;

import lombok.Builder;
import lombok.Data;

// Respuesta de registro y login: token JWT + datos del usuario para evitar una segunda llamada.
@Data
@Builder
public class AuthResponse {

    // El cliente debe enviar este token en cada request: Authorization: Bearer <token>
    private String token;

    private Long idUsuario;
    private String nombre;
    private String apellido;
    private String username;
    private String email;
    private String rol;
    private String direccion;
    private String telefono;
}
