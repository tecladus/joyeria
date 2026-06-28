package com.uade.tpo.joyeria.entity;

// Sello promocional que un vendedor/admin puede asignar manualmente a un producto
// para activar un mensaje de urgencia/escasez en el frontend.
//   - NINGUNO: sin sello manual (puede seguir mostrando escasez por stock bajo u oferta por descuento).
//   - MUY_SOLICITADO: prueba social ("Muy solicitado").
//   - EDICION_LIMITADA: sello premium de exclusividad ("Edición limitada").
public enum SelloUrgencia {
    NINGUNO,
    MUY_SOLICITADO,
    EDICION_LIMITADA
}
