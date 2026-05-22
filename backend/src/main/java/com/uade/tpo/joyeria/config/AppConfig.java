package com.uade.tpo.joyeria.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

// Separado de SecurityConfig para evitar dependencia circular.
// UsuarioService necesita PasswordEncoder, y si estuviera en SecurityConfig,
// Spring no podria crear ninguno de los dos. Aca lo rompemos.
@Configuration
public class AppConfig {

    // BCrypt: hashea passwords de forma irreversible antes de guardarlos en la BD.
    // Nunca se guarda el password en texto plano.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
