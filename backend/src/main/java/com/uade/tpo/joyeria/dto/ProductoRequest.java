package com.uade.tpo.joyeria.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

// El vendedorId no viene en este DTO; se extrae del token JWT con @AuthenticationPrincipal.
@Data
public class ProductoRequest {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    private String descripcion;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    private BigDecimal precio;

    @DecimalMin(value = "0.00", message = "El descuento no puede ser negativo")
    @DecimalMax(value = "100.00", message = "El descuento no puede superar el 100%")
    private BigDecimal descuento;

    @NotNull(message = "El stock es obligatorio")
    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock;

    private String imagenUrl;

    @NotNull(message = "La categoria es obligatoria")
    private Long categoriaId;
}
