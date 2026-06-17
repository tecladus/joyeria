package com.uade.tpo.joyeria.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

// Request para guardar (crear o actualizar) los pronósticos de un participante.
// claveEdicion es opcional: se valida en el service contra el participante existente
// o, si el usuario está logueado y es dueño del alias, no hace falta.
@Data
public class GuardarPrediccionesRequest {

    @NotBlank(message = "El alias es obligatorio")
    @Size(min = 3, max = 40, message = "El alias debe tener entre 3 y 40 caracteres")
    @Pattern(
        regexp = "^[\\p{L}0-9 ._-]+$",
        message = "El alias solo puede contener letras, números, espacios y . _ -"
    )
    private String alias;

    private String claveEdicion;

    @NotEmpty(message = "Debes enviar al menos un pronóstico")
    @Valid
    private List<PrediccionItemRequest> predicciones;
}
