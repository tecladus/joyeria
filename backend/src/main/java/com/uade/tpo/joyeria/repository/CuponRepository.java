package com.uade.tpo.joyeria.repository;

import com.uade.tpo.joyeria.entity.Cupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CuponRepository extends JpaRepository<Cupon, Long> {

    // El comprador puede escribir el codigo en cualquier combinacion de mayusculas/minusculas.
    Optional<Cupon> findByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCase(String codigo);
}
