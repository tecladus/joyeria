package com.uade.tpo.joyeria.repository;

import com.uade.tpo.joyeria.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // SELECT * FROM usuarios WHERE email = ? — usado en login y loadUserByUsername.
    Optional<Usuario> findByEmail(String email);

    // SELECT * FROM usuarios WHERE username = ?
    Optional<Usuario> findByUsername(String username);

    // SELECT COUNT(*) ... — mas eficiente que findByEmail cuando solo se necesita verificar existencia.
    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}
