package com.uade.tpo.joyeria.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

// Payload que envia el Admin para crear o editar un cupon de embajador.
@Data
public class CuponRequest {

    @NotBlank(message = "El código del cupón es requerido")
    private String codigo;

    @NotBlank(message = "El nombre del embajador es requerido")
    private String embajador;

    @NotNull(message = "El porcentaje de descuento es requerido")
    @Min(value = 1, message = "El descuento mínimo es 1%")
    @Max(value = 100, message = "El descuento máximo es 100%")
    private Integer porcentajeDescuento;

    // null = ilimitado.
    @Min(value = 1, message = "El tope de usos debe ser al menos 1")
    private Integer usosMaximos;

    // Si no se envia, el cupon se crea activo.
    private Boolean activo;
}
