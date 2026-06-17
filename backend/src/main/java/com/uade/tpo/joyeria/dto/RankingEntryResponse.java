package com.uade.tpo.joyeria.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RankingEntryResponse {

    private Integer posicion;
    private String alias;
    private Integer puntos;
    private Integer exactos;
    private Integer jugados;
}
