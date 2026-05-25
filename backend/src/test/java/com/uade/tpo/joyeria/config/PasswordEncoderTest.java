package com.uade.tpo.joyeria.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

public class PasswordEncoderTest {

    @Test
    public void generarHashPassword() {
        PasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "password123";

        // Generar hash
        String hash = encoder.encode(password);
        System.out.println("Contraseña: " + password);
        System.out.println("Hash BCrypt: " + hash);

        // Verificar que es correcto
        boolean matches = encoder.matches(password, hash);
        System.out.println("¿El hash es correcto? " + matches);

        // Probar el hash actual del archivo
        String hashActual = "$2a$10$slYQmyNdGzin7olVN3p8.OPST9/PgBkqquzi.Ss7KIUgO2t0jKMm2";
        boolean matchesActual = encoder.matches(password, hashActual);
        System.out.println("¿El hash actual en import.sql es correcto? " + matchesActual);

        // Probar el otro hash que mencionó el usuario
        String hashOtro = "$2a$10$YGPh6/cWNx3XVmUuS7l1zuuzT5HA1gO2nTKqXMfM5v5MqbAKnY0yW";
        boolean matchesOtro = encoder.matches(password, hashOtro);
        System.out.println("¿El otro hash es correcto? " + matchesOtro);
    }
}
