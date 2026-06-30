package com.uade.tpo.joyeria.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ordenes")
@Data
@NoArgsConstructor
public class Orden {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_orden")
    private Long idOrden;

    @Column(nullable = false)
    private LocalDateTime fecha;

    // Ciclo de vida: "PENDIENTE" → "PAGADA" → "ENVIADA" → "ENTREGADA" (extensible).
    @Column(nullable = false, length = 50)
    private String estado;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    // ── Cupon de embajador y puntos de fidelidad ─────────────────────────────
    // Monto bruto antes de descuentos (suma de los detalles). total = subtotal - descuentoCupon - descuentoPuntos.
    @Column(precision = 10, scale = 2)
    private BigDecimal subtotal;

    // Codigo del cupon aplicado (null si no se uso ninguno).
    @Column(name = "cupon_codigo", length = 50)
    private String cuponCodigo;

    @Column(name = "descuento_cupon", precision = 10, scale = 2)
    private BigDecimal descuentoCupon = BigDecimal.ZERO;

    // Puntos que el comprador canjeo en esta orden y el descuento en dinero que generaron.
    @Column(name = "puntos_canjeados")
    private Integer puntosCanjeados = 0;

    @Column(name = "descuento_puntos", precision = 10, scale = 2)
    private BigDecimal descuentoPuntos = BigDecimal.ZERO;

    // Puntos que esta compra le otorgo al comprador.
    @Column(name = "puntos_ganados")
    private Integer puntosGanados = 0;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "metodo_pago")
    private String metodoPago;

    @Column(name = "nombre_completo")
    private String nombreCompleto;

    private String direccion;

    private String ciudad;

    @Column(name = "codigo_postal")
    private String codigoPostal;

    private String telefono;

    @OneToMany(mappedBy = "orden", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleOrden> detalles = new ArrayList<>();

    @OneToOne(mappedBy = "orden", cascade = CascadeType.ALL, orphanRemoval = true)
    private Pago pago;
}
