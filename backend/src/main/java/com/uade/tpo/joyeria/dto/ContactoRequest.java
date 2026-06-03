package com.uade.tpo.joyeria.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ContactoRequest {

    @NotBlank(message = "El nombre es requerido")
    private String nombre;

    @NotBlank(message = "El correo electrónico es requerido")
    @Email(message = "El formato del correo es inválido")
    private String email;

    @NotBlank(message = "El asunto es requerido")
    private String asunto;

    @NotBlank(message = "El mensaje es requerido")
    private String mensaje;
}
