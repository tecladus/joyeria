package com.uade.tpo.joyeria.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoriaResponse {

    private Long idCategoria;
    private String nombre;
}
