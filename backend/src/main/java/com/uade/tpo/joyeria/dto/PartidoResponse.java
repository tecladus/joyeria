package com.uade.tpo.joyeria.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PartidoResponse {

    private Long idPartido;
    private String fase;
    private String grupo;
    private Integer jornada;
    private String equipoLocal;
    private String equipoVisitante;
    private String codigoLocal;
    private String codigoVisitante;
    private LocalDateTime fechaPartido;
    private String sede;
    private Integer golesLocal;
    private Integer golesVisitante;
    private boolean finalizado;
}
