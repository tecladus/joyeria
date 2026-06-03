package com.uade.tpo.joyeria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CheckoutRequest {

    @NotBlank(message = "El método de pago es requerido")
    private String metodoPago;

    @NotBlank(message = "El nombre completo es requerido")
    private String nombreCompleto;

    @NotBlank(message = "La dirección es requerida")
    private String direccion;

    @NotBlank(message = "La ciudad es requerida")
    private String ciudad;

    @NotBlank(message = "El código postal es requerido")
    private String codigoPostal;

    @NotBlank(message = "El teléfono es requerido")
    private String telefono;

    @NotNull(message = "El multiplicador del dispositivo es requerido")
    private BigDecimal multiplicadorDispositivo;
}
