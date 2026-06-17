package com.uade.tpo.joyeria.repository;

import com.uade.tpo.joyeria.entity.Prediccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PrediccionRepository extends JpaRepository<Prediccion, Long> {

    List<Prediccion> findByParticipante_IdParticipante(Long participanteId);

    // Todas las predicciones de un partido (para re-puntuar cuando se carga el resultado).
    List<Prediccion> findByPartido_IdPartido(Long partidoId);

    Optional<Prediccion> findByParticipante_IdParticipanteAndPartido_IdPartido(Long participanteId, Long partidoId);

    // Ranking agregado: puntos totales, exactos y partidos jugados por participante.
    @Query("SELECT p.participante.idParticipante AS participanteId, " +
           "p.participante.alias AS alias, " +
           "COALESCE(SUM(p.puntos), 0) AS puntos, " +
           "SUM(CASE WHEN p.puntos = 3 THEN 1 ELSE 0 END) AS exactos, " +
           "SUM(CASE WHEN p.partido.finalizado = true THEN 1 ELSE 0 END) AS jugados " +
           "FROM Prediccion p " +
           "GROUP BY p.participante.idParticipante, p.participante.alias")
    List<RankingProjection> obtenerRanking();
}
