package com.uade.tpo.joyeria.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

// Vista del cupon que devuelve la API (al Admin para gestion, y al comprador al validar un codigo).
@Data
@Builder
public class CuponResponse {

    private Long idCupon;
    private String codigo;
    private String embajador;
    private Integer porcentajeDescuento;
    private Boolean activo;
    private Integer usos;
    private Integer usosMaximos;
    private LocalDateTime fechaCreacion;
}
