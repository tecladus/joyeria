package com.uade.tpo.joyeria.repository;

import com.uade.tpo.joyeria.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    // SELECT * FROM roles WHERE nombre = ?
    Optional<Role> findByNombre(String nombre);
}
