package com.uade.tpo.joyeria.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

// Respuesta con el participante y sus pronósticos.
// claveEdicion SOLO se incluye al guardar (para que el cliente la persista);
// en la lectura pública por alias va null para no exponer el token de edición.
@Data
@Builder
public class ParticipanteResponse {

    private String alias;
    private String claveEdicion;
    private boolean usuarioVinculado;
    private Integer puntosTotal;
    private Integer exactos;
    private List<PrediccionResponse> predicciones;
}
