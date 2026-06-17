package com.uade.tpo.joyeria.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

// Pronóstico de un participante para un partido concreto.
// Restricción única (participante, partido): un solo pronóstico por partido y persona.
// "puntos" se recalcula cada vez que cambia el resultado real del partido.
@Entity
@Table(
    name = "prode_predicciones",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_prediccion_participante_partido",
        columnNames = {"participante_id", "partido_id"}
    )
)
@Data
@NoArgsConstructor
public class Prediccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_prediccion")
    private Long idPrediccion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "participante_id", nullable = false)
    private Participante participante;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "partido_id", nullable = false)
    private Partido partido;

    @Column(name = "goles_local", nullable = false)
    private Integer golesLocal;

    @Column(name = "goles_visitante", nullable = false)
    private Integer golesVisitante;

    // Puntos obtenidos según el resultado real (0 mientras el partido no esté finalizado).
    @Column(nullable = false)
    private Integer puntos = 0;
}
