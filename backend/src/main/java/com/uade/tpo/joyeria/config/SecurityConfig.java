package com.uade.tpo.joyeria.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

// Configuracion central de seguridad: define quien puede acceder a que endpoint y como se autentica.
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter,
                          UserDetailsService userDetailsService,
                          PasswordEncoder passwordEncoder) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // CSRF deshabilitado porque usamos JWT en headers, no cookies.
            .csrf(AbstractHttpConfigurer::disable)

            // CORS habilitado para permitir requests desde el browser (Postman Lightweight).
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Reglas de autorizacion por rol. El orden importa: la primera regla que coincide gana.
            .authorizeHttpRequests(auth -> auth

                // Registro y login son publicos.
                .requestMatchers("/api/usuarios/registro", "/api/usuarios/login").permitAll()

                // Endpoints administrativos de usuarios.
                .requestMatchers(HttpMethod.GET, "/api/usuarios").hasAnyAuthority("ADMIN", "MODERATOR")
                .requestMatchers(HttpMethod.PUT, "/api/usuarios/*/rol").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/usuarios/*").hasAuthority("ADMIN")

                // Escritura de productos: VENDEDOR o ADMIN. Eliminacion tambien por MODERATOR.
                .requestMatchers(HttpMethod.POST, "/api/productos/**").hasAnyAuthority("VENDEDOR", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/productos/**").hasAnyAuthority("VENDEDOR", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/productos/**").hasAnyAuthority("VENDEDOR", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/productos/**").hasAnyAuthority("VENDEDOR", "ADMIN", "MODERATOR")

                // Categorias: GET publico sin token, escritura VENDEDOR o ADMIN.
                .requestMatchers(HttpMethod.GET, "/api/categorias/**").permitAll()
                .requestMatchers("/api/categorias/**").hasAnyAuthority("VENDEDOR", "ADMIN")

                // Carrito: exclusivo para COMPRADOR.
                .requestMatchers("/api/carrito/**").hasAuthority("COMPRADOR")

                // Ordenes: checkout y listar propio son para COMPRADOR, ver todas / actualizar estado para ADMIN y MODERATOR.
                .requestMatchers(HttpMethod.POST, "/api/ordenes/checkout").hasAuthority("COMPRADOR")
                .requestMatchers(HttpMethod.GET, "/api/ordenes").hasAuthority("COMPRADOR")
                .requestMatchers(HttpMethod.GET, "/api/ordenes/todas").hasAnyAuthority("ADMIN", "MODERATOR")
                .requestMatchers(HttpMethod.PATCH, "/api/ordenes/*/estado").hasAnyAuthority("ADMIN", "MODERATOR")
                .requestMatchers(HttpMethod.GET, "/api/ordenes/*").hasAnyAuthority("COMPRADOR", "ADMIN", "MODERATOR")

                // Lectura de productos: publico sin token.
                .requestMatchers(HttpMethod.GET, "/api/productos", "/api/productos/**").permitAll()

                // Cualquier otro endpoint requiere autenticacion.
                .anyRequest().authenticated()
            )

            // STATELESS: no hay sesiones. Cada request se autentica desde cero con el token JWT.
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Proveedor de autenticacion: usa UsuarioService + BCrypt para verificar credenciales.
            .authenticationProvider(authenticationProvider())

            // El filtro JWT se ejecuta antes del filtro estandar de Spring.
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Combina UserDetailsService y PasswordEncoder para autenticar usuarios contra la BD.
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    // Expuesto como Bean para poder autenticar usuarios programaticamente si se necesita.
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // Configura los origenes permitidos de CORS dinamicamente
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        if (allowedOrigins != null && !allowedOrigins.trim().isEmpty()) {
            config.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        } else {
            config.setAllowedOrigins(List.of("http://localhost:5173"));
        }
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

}

