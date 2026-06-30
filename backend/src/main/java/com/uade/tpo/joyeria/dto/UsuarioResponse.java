package com.uade.tpo.joyeria.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

// Datos del usuario expuestos por la API; nunca incluye el password.
@Data
@Builder
public class UsuarioResponse {

    private Long idUsuario;
    private String nombre;
    private String apellido;
    private String username;
    private String email;
    private String direccion;
    private String telefono;
    private LocalDateTime fechaCreacion;
    private String rol;
    private Integer puntos;
}
