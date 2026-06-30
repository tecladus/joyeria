package com.uade.tpo.joyeria.exception;

// Se lanza al intentar crear un cupon con un codigo que ya existe.
// El GlobalExceptionHandler la traduce a 409 Conflict.
public class CuponDuplicadoException extends RuntimeException {
    public CuponDuplicadoException(String mensaje) {
        super(mensaje);
    }
}
