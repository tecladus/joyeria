package com.uade.tpo.joyeria.controller;

import com.uade.tpo.joyeria.dto.ContactoRequest;
import com.uade.tpo.joyeria.service.MailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/contacto")
public class ContactoController {

    @Autowired
    private MailService mailService;

    // Mapa en memoria para limitar la tasa de envíos (Rate Limiting / Anti-Spam)
    private final ConcurrentHashMap<String, Long> rateLimitMap = new ConcurrentHashMap<>();
    private static final long LIMIT_MS = 60000; // 60 segundos de espera entre envíos

    @PostMapping
    public ResponseEntity<?> enviarMensaje(@Valid @RequestBody ContactoRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        long ahora = System.currentTimeMillis();

        // Limpieza de registros antiguos (mayores a 5 minutos) para evitar acumulación de memoria
        rateLimitMap.entrySet().removeIf(entry -> (ahora - entry.getValue()) > 300000);

        if (rateLimitMap.containsKey(email)) {
            long transcurrido = ahora - rateLimitMap.get(email);
            if (transcurrido < LIMIT_MS) {
                long segundosRestantes = (LIMIT_MS - transcurrido) / 1000;
                return ResponseEntity.status(429).body(Map.of(
                        "error", "Has enviado un mensaje recientemente. Por favor, espera " + segundosRestantes + " segundos antes de enviar otro mensaje de contacto."
                ));
            }
        }

        rateLimitMap.put(email, ahora);

        mailService.enviarFormularioContacto(
                request.getEmail(),
                request.getNombre(),
                request.getAsunto(),
                request.getMensaje()
        );
        return ResponseEntity.ok(Map.of("message", "Su mensaje de contacto ha sido enviado con éxito"));
    }
}
