package com.uade.tpo.joyeria.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

// Entidad JPA y contrato de Spring Security en una sola clase.
// Spring Security la usa directamente para autenticar requests y verificar roles.
@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
public class Usuario implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    // Email como identificador unico del usuario para comunicaciones.
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    // Siempre hasheado con BCrypt; nunca se guarda en texto plano.
    @Column(nullable = false)
    private String password;

    @Column(length = 200)
    private String direccion;

    @Column(length = 20)
    private String telefono;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    // EAGER: necesario porque getAuthorities() requiere el rol en cada request autenticado.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rol_id", nullable = false)
    private Role rol;

    // ── UserDetails ───────────────────────────────────────────────────────────

    // SecurityConfig usa el nombre del rol con hasAuthority("VENDEDOR") / hasAuthority("COMPRADOR").
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(rol.getNombre()));
    }

    // Spring Security usa el email como identificador; JwtService lo guarda como subject del token.
    @Override
    public String getUsername() {
        return email;
    }

    // Retorna el nombre de usuario real (campo username) sin el conflicto de getUsername()
    public String getNombreUsuario() {
        return this.username;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
