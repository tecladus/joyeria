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
