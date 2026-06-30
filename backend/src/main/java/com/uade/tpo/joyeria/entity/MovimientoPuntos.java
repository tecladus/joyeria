package com.uade.tpo.joyeria.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// Historial de puntos de fidelidad (estilo MyMcDonald's Rewards).
// Cada fila es un movimiento: puntos ganados en una compra, canjeados como descuento, o revertidos.
// El saldo vivo se guarda en Usuario.puntos; esta tabla es el detalle auditable de como se llego a ese saldo.
@Entity
@Table(name = "movimientos_puntos")
@Data
@NoArgsConstructor
public class MovimientoPuntos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_movimiento")
    private Long idMovimiento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // "GANADO" | "CANJEADO" | "REVERTIDO"
    @Column(nullable = false, length = 20)
    private String tipo;

    // Cantidad con signo: positiva cuando suma al saldo, negativa cuando lo descuenta.
    @Column(nullable = false)
    private Integer puntos;

    @Column(length = 200)
    private String descripcion;

    @Column(nullable = false)
    private LocalDateTime fecha;

    // Orden que origino el movimiento (puede ser null para ajustes manuales).
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_id")
    private Orden orden;
}
