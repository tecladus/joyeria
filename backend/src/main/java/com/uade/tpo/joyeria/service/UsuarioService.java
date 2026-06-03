package com.uade.tpo.joyeria.service;

import com.uade.tpo.joyeria.config.JwtService;
import com.uade.tpo.joyeria.dto.AuthResponse;
import com.uade.tpo.joyeria.dto.LoginRequest;
import com.uade.tpo.joyeria.dto.RegistroRequest;
import com.uade.tpo.joyeria.dto.UsuarioResponse;
import com.uade.tpo.joyeria.entity.Role;
import com.uade.tpo.joyeria.entity.Usuario;
import com.uade.tpo.joyeria.exception.CredencialesInvalidasException;
import com.uade.tpo.joyeria.exception.EmailDuplicadoException;
import com.uade.tpo.joyeria.exception.RecursoNoEncontradoException;
import com.uade.tpo.joyeria.repository.RoleRepository;
import com.uade.tpo.joyeria.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

// Maneja registro y login de usuarios.
// Implementa UserDetailsService para que Spring Security pueda cargar usuarios desde la BD.
@Service
public class UsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // Spring Security llama a este metodo en cada request con token
    // para verificar que el usuario del token siga existiendo en la BD.
    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        return usuarioRepository.findByEmail(identifier)
                .or(() -> usuarioRepository.findByUsername(identifier))
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + identifier));
    }

    // Registra un nuevo usuario: valida email unico, hashea password y genera token JWT.
    // El usuario puede usar la app inmediatamente sin necesidad de hacer login por separado.
    public AuthResponse registrar(RegistroRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new EmailDuplicadoException("El email ya esta registrado: " + request.getEmail());
        }
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new EmailDuplicadoException("El nombre de usuario ya esta registrado: " + request.getUsername());
        }

        Role rol = roleRepository.findById(request.getRolId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Rol no encontrado: " + request.getRolId()));

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setApellido(request.getApellido());
        usuario.setUsername(request.getUsername());
        usuario.setEmail(request.getEmail());
        // El password NUNCA se guarda en texto plano. BCrypt lo convierte en un hash irreversible.
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setDireccion(request.getDireccion());
        usuario.setTelefono(request.getTelefono());
        usuario.setFechaCreacion(LocalDateTime.now());
        usuario.setRol(rol);

        Usuario guardado = usuarioRepository.save(usuario);

        String token = jwtService.generateToken(guardado);
        return mapearAAuthResponse(guardado, token);
    }

    // Autentica al usuario: verifica email y password, devuelve token JWT si son correctos.
    // El mensaje de error es generico para no revelar si fallo el email o la password.
    public AuthResponse login(LoginRequest request) {
        String identificador = request.getEmail();
        Usuario usuario = usuarioRepository.findByEmail(identificador)
                .or(() -> usuarioRepository.findByUsername(identificador))
                .orElseThrow(() -> new CredencialesInvalidasException("La cuenta no existe"));

        // BCrypt compara el password ingresado contra el hash guardado sin desencriptarlo.
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new CredencialesInvalidasException("Contraseña incorrecta");
        }

        String token = jwtService.generateToken(usuario);
        return mapearAAuthResponse(usuario, token);
    }

    // Usado internamente por CarritoService, OrdenService y ProductoService.
    public Usuario obtenerPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado: " + id));
    }

    // Devuelve el perfil del usuario autenticado sin exponer campos internos.
    public UsuarioResponse obtenerPerfil(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
        return mapearAUsuarioResponse(usuario);
    }

    private AuthResponse mapearAAuthResponse(Usuario usuario, String token) {
        return AuthResponse.builder()
                .token(token)
                .idUsuario(usuario.getIdUsuario())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .username(usuario.getNombreUsuario())
                .email(usuario.getEmail())
                .rol(usuario.getRol().getNombre())
                .direccion(usuario.getDireccion())
                .telefono(usuario.getTelefono())
                .build();
    }

    // El password nunca sale de la capa de servicio.
    private UsuarioResponse mapearAUsuarioResponse(Usuario usuario) {
        return UsuarioResponse.builder()
                .idUsuario(usuario.getIdUsuario())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .username(usuario.getNombreUsuario())
                .email(usuario.getEmail())
                .direccion(usuario.getDireccion())
                .telefono(usuario.getTelefono())
                .fechaCreacion(usuario.getFechaCreacion())
                .rol(usuario.getRol().getNombre())
                .build();
    }

    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::mapearAUsuarioResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public UsuarioResponse cambiarRol(Long id, Long nuevoRolId) {
        Usuario usuario = obtenerPorId(id);
        if (usuario.getRol().getIdRol() == 3) {
            throw new IllegalArgumentException("No se puede cambiar el rol del Administrador del sistema.");
        }
        if (nuevoRolId == 3) {
            throw new IllegalArgumentException("No se puede asignar el rol de Administrador a otros usuarios.");
        }
        Role rol = roleRepository.findById(nuevoRolId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Rol no encontrado: " + nuevoRolId));
        usuario.setRol(rol);
        return mapearAUsuarioResponse(usuarioRepository.save(usuario));
    } 

    @Transactional
    public void eliminarUsuario(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Usuario no encontrado: " + id);
        }
        usuarioRepository.deleteById(id);
    }

    @Transactional
    public AuthResponse convertirseEnVendedor(Long id) {
        Usuario usuario = obtenerPorId(id);
        if (usuario.getRol().getIdRol() != 1) {
            throw new IllegalArgumentException("Sólo los compradores pueden convertirse en vendedores.");
        }
        Role rolVendedor = roleRepository.findById(2L)
                .orElseThrow(() -> new RecursoNoEncontradoException("Rol VENDEDOR no encontrado"));
        usuario.setRol(rolVendedor);
        Usuario guardado = usuarioRepository.save(usuario);
        
        String token = jwtService.generateToken(guardado);
        return mapearAAuthResponse(guardado, token);
    }
}

