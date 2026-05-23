package com.uade.tpo.joyeria.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

// categoria y vendedor como String para evitar objetos anidados y riesgo de bucles de serializacion.
@Data
@Builder
public class ProductoResponse {

    private Long idProducto;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private BigDecimal descuento;
    private Integer stock;
    private String imagenUrl;
    private Long idCategoria;
    private String categoria;
    private String vendedor;
}
