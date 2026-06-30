package com.uade.tpo.joyeria.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// Cupon de embajador estilo "codigo de creador" de Fortnite.
// El comprador ingresa el codigo en el checkout y obtiene un % de descuento.
// Cada cupon esta asociado al nombre de un embajador y lleva la cuenta de cuantas veces se uso.
@Entity
@Table(name = "cupones")
@Data
@NoArgsConstructor
public class Cupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cupon")
    private Long idCupon;

    // Codigo que el comprador escribe en el carrito. Se guarda siempre en MAYUSCULAS y es unico.
    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    // Nombre del embajador dueño del codigo (ej: "Lionel Messi"). Solo informativo.
    @Column(nullable = false, length = 100)
    private String embajador;

    // Porcentaje de descuento que aplica el cupon sobre el subtotal (1 a 100).
    @Column(name = "porcentaje_descuento", nullable = false)
    private Integer porcentajeDescuento;

    // Un cupon inactivo existe pero no puede aplicarse en el checkout.
    @Column(nullable = false)
    private Boolean activo = true;

    // Cantidad de veces que el cupon ya fue usado.
    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer usos = 0;

    // Tope de usos. null = ilimitado. Cuando usos >= usosMaximos el cupon deja de validar.
    @Column(name = "usos_maximos")
    private Integer usosMaximos;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
}
