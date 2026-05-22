package com.uade.tpo.joyeria.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

// Todos los endpoints de carrito devuelven el estado completo actualizado.
@Data
@Builder
public class CarritoResponse {

    private Long idCarrito;
    private List<ItemCarritoResponse> items;
    private BigDecimal total;

    @Data
    @Builder
    public static class ItemCarritoResponse {
        private Long idItem;
        private Long idProducto;
        private String nombreProducto;
        private BigDecimal precioUnitario;
        private Integer cantidad;
        private BigDecimal subtotal;
    }
}
