package com.uade.tpo.joyeria.service;

import com.uade.tpo.joyeria.dto.PuntosResponse;
import com.uade.tpo.joyeria.entity.MovimientoPuntos;
import com.uade.tpo.joyeria.entity.Orden;
import com.uade.tpo.joyeria.entity.Usuario;
import com.uade.tpo.joyeria.exception.RecursoNoEncontradoException;
import com.uade.tpo.joyeria.repository.MovimientoPuntosRepository;
import com.uade.tpo.joyeria.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

// Programa de puntos de fidelidad (estilo MyMcDonald's Rewards).
// Reglas (definidas como constantes para no hardcodearlas en varios lugares):
//   - Se gana 1 punto por cada $1 gastado (PUNTOS_POR_PESO).
//   - Se canjea de a 100 puntos (BLOQUE_CANJE), cada bloque vale $5 (VALOR_BLOQUE).
@Service
public class PuntosService {

    public static final int PUNTOS_POR_PESO = 1;
    public static final int BLOQUE_CANJE = 100;
    public static final BigDecimal VALOR_BLOQUE = new BigDecimal("5");

    private final UsuarioRepository usuarioRepository;
    private final MovimientoPuntosRepository movimientoPuntosRepository;

    public PuntosService(UsuarioRepository usuarioRepository,
                         MovimientoPuntosRepository movimientoPuntosRepository) {
        this.usuarioRepository = usuarioRepository;
        this.movimientoPuntosRepository = movimientoPuntosRepository;
    }

    // ── Calculos puros (no tocan la BD) ──────────────────────────────────────

    // Puntos que otorga gastar un cierto monto: 1 punto por peso, redondeando hacia abajo.
    public int calcularPuntosGanados(BigDecimal monto) {
        if (monto == null || monto.signum() <= 0) return 0;
        return monto.setScale(0, RoundingMode.FLOOR).intValue() * PUNTOS_POR_PESO;
    }

    // Descuento en dinero que generan N puntos. Solo cuentan los bloques completos de 100.
    public BigDecimal calcularDescuentoPorPuntos(int puntos) {
        if (puntos < BLOQUE_CANJE) return BigDecimal.ZERO;
        int bloques = puntos / BLOQUE_CANJE;
        return VALOR_BLOQUE.multiply(BigDecimal.valueOf(bloques)).setScale(2, RoundingMode.HALF_UP);
    }

    // ── Operaciones sobre el saldo (se ejecutan dentro de la transaccion del checkout) ──

    // Suma puntos ganados por una compra.
    public void otorgarPuntos(Usuario usuario, Orden orden, int puntos, String descripcion) {
        if (puntos <= 0) return;
        registrarMovimiento(usuario, orden, "GANADO", puntos, descripcion);
    }

    // Descuenta puntos canjeados como descuento. Valida saldo y que sea multiplo del bloque.
    public void canjearPuntos(Usuario usuario, Orden orden, int puntos, String descripcion) {
        if (puntos <= 0) return;
        if (puntos % BLOQUE_CANJE != 0) {
            throw new IllegalArgumentException("Los puntos a canjear deben ser múltiplos de " + BLOQUE_CANJE + ".");
        }
        int saldo = usuario.getPuntos() == null ? 0 : usuario.getPuntos();
        if (puntos > saldo) {
            throw new IllegalArgumentException("No tenés puntos suficientes. Saldo disponible: " + saldo + ".");
        }
        registrarMovimiento(usuario, orden, "CANJEADO", -puntos, descripcion);
    }

    // Devuelve al usuario los puntos que habia canjeado (cuando se cancela una orden).
    public void reintegrarPuntos(Usuario usuario, int puntos, String descripcion) {
        if (puntos <= 0) return;
        registrarMovimiento(usuario, null, "REVERTIDO", puntos, descripcion);
    }

    // Quita puntos que se habian otorgado (cuando se cancela una orden ya acreditada).
    public void quitarPuntosGanados(Usuario usuario, int puntos, String descripcion) {
        if (puntos <= 0) return;
        registrarMovimiento(usuario, null, "REVERTIDO", -puntos, descripcion);
    }

    // Aplica el delta al saldo (sin permitir saldo negativo) y deja registro auditable.
    private void registrarMovimiento(Usuario usuario, Orden orden, String tipo, int puntosConSigno, String descripcion) {
        int saldoActual = usuario.getPuntos() == null ? 0 : usuario.getPuntos();
        int nuevoSaldo = Math.max(0, saldoActual + puntosConSigno);
        int deltaReal = nuevoSaldo - saldoActual;

        usuario.setPuntos(nuevoSaldo);
        usuarioRepository.save(usuario);

        MovimientoPuntos mov = new MovimientoPuntos();
        mov.setUsuario(usuario);
        mov.setOrden(orden);
        mov.setTipo(tipo);
        mov.setPuntos(deltaReal);
        mov.setDescripcion(descripcion);
        mov.setFecha(LocalDateTime.now());
        movimientoPuntosRepository.save(mov);
    }

    // ── Consulta para el frontend ────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PuntosResponse obtenerSaldo(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado: " + usuarioId));

        int saldo = usuario.getPuntos() == null ? 0 : usuario.getPuntos();

        List<PuntosResponse.MovimientoPuntosResponse> historial = movimientoPuntosRepository
                .findByUsuarioOrderByFechaDesc(usuario).stream()
                .map(m -> PuntosResponse.MovimientoPuntosResponse.builder()
                        .idMovimiento(m.getIdMovimiento())
                        .tipo(m.getTipo())
                        .puntos(m.getPuntos())
                        .descripcion(m.getDescripcion())
                        .fecha(m.getFecha())
                        .idOrden(m.getOrden() != null ? m.getOrden().getIdOrden() : null)
                        .build())
                .collect(Collectors.toList());

        return PuntosResponse.builder()
                .saldo(saldo)
                .valorEnDinero(calcularDescuentoPorPuntos(saldo))
                .puntosPorPeso(PUNTOS_POR_PESO)
                .bloqueCanje(BLOQUE_CANJE)
                .valorBloque(VALOR_BLOQUE)
                .historial(historial)
                .build();
    }
}
