package com.uade.tpo.joyeria.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

// Un pronóstico individual dentro del request de guardado.
@Data
public class PrediccionItemRequest {

    @NotNull(message = "El partido es obligatorio")
    private Long partidoId;

    @NotNull(message = "Los goles del local son obligatorios")
    @Min(value = 0, message = "Los goles no pueden ser negativos")
    @Max(value = 99, message = "El marcador es demasiado alto")
    private Integer golesLocal;

    @NotNull(message = "Los goles del visitante son obligatorios")
    @Min(value = 0, message = "Los goles no pueden ser negativos")
    @Max(value = 99, message = "El marcador es demasiado alto")
    private Integer golesVisitante;
}
