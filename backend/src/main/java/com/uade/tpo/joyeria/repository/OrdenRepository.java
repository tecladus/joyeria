package com.uade.tpo.joyeria.repository;

import com.uade.tpo.joyeria.entity.Orden;
import com.uade.tpo.joyeria.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrdenRepository extends JpaRepository<Orden, Long> {

    // Historial de compras del usuario autenticado.
    List<Orden> findByUsuario(Usuario usuario);
}
