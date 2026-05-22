package com.uade.tpo.joyeria.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// Entidad preparada para integracion futura con pasarela de pagos (MercadoPago, Stripe, etc.).
@Entity
@Table(name = "pagos")
@Data
@NoArgsConstructor
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago")
    private Long idPago;

    @Column(nullable = false, length = 50)
    private String metodo;

    @Column(nullable = false, length = 50)
    private String estado;

    @Column(nullable = false)
    private LocalDateTime fecha;

    // unique = true: una orden no puede tener mas de un pago.
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "orden_id", nullable = false, unique = true)
    private Orden orden;
}
