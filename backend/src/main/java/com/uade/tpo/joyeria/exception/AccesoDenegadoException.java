package com.uade.tpo.joyeria.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// HTTP 403: usuario autenticado sin permiso sobre un recurso especifico (ownership).
// Los casos de rol incorrecto los maneja Spring Security antes de llegar al controller.
@ResponseStatus(HttpStatus.FORBIDDEN)
public class AccesoDenegadoException extends RuntimeException {

    public AccesoDenegadoException(String mensaje) {
        super(mensaje);
    }
}
