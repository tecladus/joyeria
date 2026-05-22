package com.uade.tpo.joyeria.repository;

import com.uade.tpo.joyeria.entity.Carrito;
import com.uade.tpo.joyeria.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CarritoRepository extends JpaRepository<Carrito, Long> {

    // Carrito activo del usuario — punto de entrada de todas las operaciones de carrito.
    Optional<Carrito> findByUsuarioAndActivoTrue(Usuario usuario);
}
