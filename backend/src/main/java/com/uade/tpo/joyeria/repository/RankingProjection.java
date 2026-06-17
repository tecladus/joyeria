package com.uade.tpo.joyeria.repository;

// Proyección de Spring Data para el ranking agregado del prode.
// Los nombres de los getters coinciden con los alias del SELECT en PrediccionRepository.
public interface RankingProjection {

    Long getParticipanteId();

    String getAlias();

    Long getPuntos();

    // Cantidad de resultados exactos acertados (predicción que sumó 3).
    Long getExactos();

    // Cantidad de partidos finalizados sobre los que el participante había pronosticado.
    Long getJugados();
}
