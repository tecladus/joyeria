package com.uade.tpo.joyeria.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PrediccionResponse {

    private Long partidoId;
    private Integer golesLocal;
    private Integer golesVisitante;
    // Puntos obtenidos por esta predicción (0 si el partido aún no finalizó).
    private Integer puntos;
}
