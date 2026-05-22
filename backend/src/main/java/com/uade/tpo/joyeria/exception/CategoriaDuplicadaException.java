package com.uade.tpo.joyeria.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// HTTP 409: intento de crear una categoria con un nombre que ya existe.
@ResponseStatus(HttpStatus.CONFLICT)
public class CategoriaDuplicadaException extends RuntimeException {

    public CategoriaDuplicadaException(String mensaje) {
        super(mensaje);
    }
}
