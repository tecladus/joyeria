package com.uade.tpo.joyeria.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoriaRequest {

    @NotBlank(message = "El nombre de la categoria es obligatorio")
    private String nombre;
}
