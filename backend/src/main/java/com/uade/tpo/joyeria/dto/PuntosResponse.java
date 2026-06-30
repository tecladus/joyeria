package com.uade.tpo.joyeria.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

// Saldo de puntos del usuario, su valor en dinero y el historial de movimientos.
@Data
@Builder
public class PuntosResponse {

    // Saldo actual de puntos.
    private Integer saldo;

    // Cuanto vale ese saldo en dinero si se canjeara completo (en bloques de 100).
    private BigDecimal valorEnDinero;

    // Reglas del programa, para mostrarlas en el frontend sin hardcodear.
    private Integer puntosPorPeso;        // puntos ganados por cada $1 gastado
    private Integer bloqueCanje;          // de a cuantos puntos se canjea
    private BigDecimal valorBloque;       // dinero que vale cada bloque

    private List<MovimientoPuntosResponse> historial;

    @Data
    @Builder
    public static class MovimientoPuntosResponse {
        private Long idMovimiento;
        private String tipo;
        private Integer puntos;
        private String descripcion;
        private LocalDateTime fecha;
        private Long idOrden;
    }
}
