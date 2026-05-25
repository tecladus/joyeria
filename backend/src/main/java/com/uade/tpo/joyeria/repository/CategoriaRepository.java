package com.uade.tpo.joyeria.repository;

import com.uade.tpo.joyeria.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    Optional<Categoria> findByNombre(String nombre);

    // Usado en CategoriaService.crear() para prevenir duplicados antes del INSERT.
    boolean existsByNombre(String nombre);

    @Query("SELECT COUNT(p) FROM Producto p WHERE p.categoria.idCategoria = :categoriaId")
    long countProductosByCategoria(@Param("categoriaId") Long categoriaId);
}
