package com.uade.tpo.joyeria.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerarHashPassword {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "password123";
        String hash = encoder.encode(password);

        System.out.println("Contraseña: " + password);
        System.out.println("Hash BCrypt: " + hash);

        // Verificar que el hash funciona
        boolean matches = encoder.matches(password, hash);
        System.out.println("Verificación: " + matches);
    }
}
