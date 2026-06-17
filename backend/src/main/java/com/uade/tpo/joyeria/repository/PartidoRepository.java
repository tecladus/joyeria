package com.uade.tpo.joyeria.repository;

import com.uade.tpo.joyeria.entity.Partido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PartidoRepository extends JpaRepository<Partido, Long> {

    // Ordenados cronológicamente para mostrar el fixture en orden natural.
    List<Partido> findAllByOrderByFechaPartidoAscIdPartidoAsc();
}
