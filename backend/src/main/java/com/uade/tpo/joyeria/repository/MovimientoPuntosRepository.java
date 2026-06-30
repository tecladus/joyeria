package com.uade.tpo.joyeria.repository;

import com.uade.tpo.joyeria.entity.MovimientoPuntos;
import com.uade.tpo.joyeria.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimientoPuntosRepository extends JpaRepository<MovimientoPuntos, Long> {

    // Historial de puntos del usuario, del mas reciente al mas antiguo.
    List<MovimientoPuntos> findByUsuarioOrderByFechaDesc(Usuario usuario);
}
