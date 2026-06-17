package com.uade.tpo.joyeria.repository;

import com.uade.tpo.joyeria.entity.Participante;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ParticipanteRepository extends JpaRepository<Participante, Long> {

    // El alias es único sin distinguir mayúsculas/minúsculas.
    Optional<Participante> findByAliasIgnoreCase(String alias);

    boolean existsByAliasIgnoreCase(String alias);

    // Para que un usuario logueado recupere su participante desde cualquier dispositivo.
    Optional<Participante> findByUsuarioId(Long usuarioId);
}
