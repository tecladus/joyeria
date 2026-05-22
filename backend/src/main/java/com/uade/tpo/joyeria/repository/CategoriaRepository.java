package com.uade.tpo.joyeria.repository;

import com.uade.tpo.joyeria.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    Optional<Categoria> findByNombre(String nombre);

    // Usado en CategoriaService.crear() para prevenir duplicados antes del INSERT.
    boolean existsByNombre(String nombre);
}
