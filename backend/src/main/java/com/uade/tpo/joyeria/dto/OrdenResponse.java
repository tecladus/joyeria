package com.uade.tpo.joyeria.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrdenResponse {

    private Long idOrden;
    private LocalDateTime fecha;
    private String estado;
    private BigDecimal total;
    private String usuario;
    private List<DetalleOrdenResponse> detalles;

    @Data
    @Builder
    public static class DetalleOrdenResponse {
        private Long idDetalle;
        private String nombreProducto;
        private Integer cantidad;
        // Precio congelado al momento de la compra; no refleja cambios posteriores del producto.
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
    }
}
