package com.uade.tpo.joyeria.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// HTTP 401: login fallido por email o password incorrectos.
// El mensaje es siempre generico ("Credenciales invalidas") para no revelar cual de los dos fallo.
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class CredencialesInvalidasException extends RuntimeException {

    public CredencialesInvalidasException(String mensaje) {
        super(mensaje);
    }
}
