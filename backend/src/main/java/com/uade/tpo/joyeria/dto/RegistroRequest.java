package com.uade.tpo.joyeria.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegistroRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @NotBlank(message = "El nombre de usuario es obligatorio")
    private String username;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene formato valido")
    private String email;

    // Llega en texto plano; UsuarioService lo hashea con BCrypt antes de persistirlo.
    @NotBlank(message = "La password es obligatoria")
    private String password;

    private String direccion;
    private String telefono;

    // rolId 1 = COMPRADOR, 2 = VENDEDOR (segun tabla roles en BD).
    @NotNull(message = "El rol es obligatorio")
    private Long rolId;
}
