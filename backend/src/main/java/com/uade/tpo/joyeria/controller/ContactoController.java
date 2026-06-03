package com.uade.tpo.joyeria.controller;

import com.uade.tpo.joyeria.dto.ContactoRequest;
import com.uade.tpo.joyeria.service.MailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contacto")
public class ContactoController {

    @Autowired
    private MailService mailService;

    @PostMapping
    public ResponseEntity<?> enviarMensaje(@Valid @RequestBody ContactoRequest request) {
        mailService.enviarFormularioContacto(
                request.getEmail(),
                request.getNombre(),
                request.getAsunto(),
                request.getMensaje()
        );
        return ResponseEntity.ok(Map.of("message", "Su mensaje de contacto ha sido enviado con éxito"));
    }
}
