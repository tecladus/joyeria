package com.uade.tpo.joyeria.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// Partido del Mundial sobre el que los participantes pronostican.
// El resultado real (golesLocal/golesVisitante) queda null hasta que un admin lo carga.
@Entity
@Table(name = "prode_partidos")
@Data
@NoArgsConstructor
public class Partido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_partido")
    private Long idPartido;

    // Fase del torneo: GRUPOS, OCTAVOS, CUARTOS, SEMIFINAL, TERCER_PUESTO, FINAL.
    @Column(nullable = false, length = 30)
    private String fase;

    // Grupo (A..L) en fase de grupos; null en eliminatorias.
    @Column(length = 5)
    private String grupo;

    // Jornada / fecha del grupo (1..3 en fase de grupos).
    private Integer jornada;

    @Column(name = "equipo_local", nullable = false, length = 60)
    private String equipoLocal;

    @Column(name = "equipo_visitante", nullable = false, length = 60)
    private String equipoVisitante;

    // Código de país para la bandera (flagcdn): ISO 3166-1 alpha-2 en minúscula,
    // o subcódigo como "gb-eng" para Inglaterra. Por eso admite hasta 10 caracteres.
    @Column(name = "codigo_local", length = 10)
    private String codigoLocal;

    @Column(name = "codigo_visitante", length = 10)
    private String codigoVisitante;

    @Column(name = "fecha_partido")
    private LocalDateTime fechaPartido;

    @Column(length = 90)
    private String sede;

    // Resultado real: null hasta que el partido se cierra con su marcador.
    @Column(name = "goles_local")
    private Integer golesLocal;

    @Column(name = "goles_visitante")
    private Integer golesVisitante;

    // Cuando es true, el marcador es definitivo y las predicciones ya fueron puntuadas.
    @Column(nullable = false)
    private boolean finalizado = false;
}
