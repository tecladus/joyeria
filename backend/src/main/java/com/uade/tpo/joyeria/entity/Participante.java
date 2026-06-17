package com.uade.tpo.joyeria.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// Jugador del prode. Como el prode es público, se identifica por un alias único.
// Para poder editar sus pronósticos sin estar logueado se genera una clave de edición
// (token) que el frontend guarda; si el participante está asociado a una cuenta,
// el usuario logueado dueño también puede editarlo desde cualquier dispositivo.
@Entity
@Table(name = "prode_participantes")
@Data
@NoArgsConstructor
public class Participante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_participante")
    private Long idParticipante;

    // Nombre visible en el ranking. Único (validado sin distinguir mayúsculas en el service).
    @Column(nullable = false, unique = true, length = 40)
    private String alias;

    // Token secreto generado al crear; habilita la edición de pronósticos sin sesión.
    @Column(name = "clave_edicion", nullable = false, length = 64)
    private String claveEdicion;

    // Cuenta dueña del participante (null si fue creado de forma anónima).
    @Column(name = "usuario_id")
    private Long usuarioId;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
}
