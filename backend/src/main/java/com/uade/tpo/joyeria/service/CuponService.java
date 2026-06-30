package com.uade.tpo.joyeria.service;

import com.uade.tpo.joyeria.dto.CuponRequest;
import com.uade.tpo.joyeria.dto.CuponResponse;
import com.uade.tpo.joyeria.entity.Cupon;
import com.uade.tpo.joyeria.exception.CuponDuplicadoException;
import com.uade.tpo.joyeria.exception.RecursoNoEncontradoException;
import com.uade.tpo.joyeria.repository.CuponRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

// Gestion de cupones de embajador. El Admin los crea/edita/borra; el checkout los valida y registra su uso.
@Service
public class CuponService {

    private final CuponRepository cuponRepository;

    public CuponService(CuponRepository cuponRepository) {
        this.cuponRepository = cuponRepository;
    }

    // ── Gestion (Admin) ──────────────────────────────────────────────────────

    public List<CuponResponse> listar() {
        return cuponRepository.findAll().stream()
                .map(this::mapear)
                .collect(Collectors.toList());
    }

    @Transactional
    public CuponResponse crear(CuponRequest request) {
        String codigo = normalizar(request.getCodigo());
        if (cuponRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new CuponDuplicadoException("Ya existe un cupón con el código: " + codigo);
        }

        Cupon cupon = new Cupon();
        cupon.setCodigo(codigo);
        cupon.setEmbajador(request.getEmbajador().trim());
        cupon.setPorcentajeDescuento(request.getPorcentajeDescuento());
        cupon.setUsosMaximos(request.getUsosMaximos());
        cupon.setActivo(request.getActivo() == null ? true : request.getActivo());
        cupon.setUsos(0);
        cupon.setFechaCreacion(LocalDateTime.now());

        return mapear(cuponRepository.save(cupon));
    }

    @Transactional
    public CuponResponse actualizar(Long id, CuponRequest request) {
        Cupon cupon = obtenerEntidad(id);
        String codigo = normalizar(request.getCodigo());

        // Si cambia el codigo, verificar que no choque con otro cupon existente.
        if (!cupon.getCodigo().equalsIgnoreCase(codigo) && cuponRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new CuponDuplicadoException("Ya existe un cupón con el código: " + codigo);
        }

        cupon.setCodigo(codigo);
        cupon.setEmbajador(request.getEmbajador().trim());
        cupon.setPorcentajeDescuento(request.getPorcentajeDescuento());
        cupon.setUsosMaximos(request.getUsosMaximos());
        if (request.getActivo() != null) {
            cupon.setActivo(request.getActivo());
        }

        return mapear(cuponRepository.save(cupon));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!cuponRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Cupón no encontrado: " + id);
        }
        cuponRepository.deleteById(id);
    }

    public Cupon obtenerEntidad(Long id) {
        return cuponRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Cupón no encontrado: " + id));
    }

    // ── Validacion y uso (checkout) ──────────────────────────────────────────

    // Devuelve el cupon si es valido para usar; si no, lanza una excepcion con el motivo.
    // Reglas: debe existir, estar activo y no haber alcanzado su tope de usos.
    public Cupon validarParaUso(String codigo) {
        Cupon cupon = cuponRepository.findByCodigoIgnoreCase(normalizar(codigo))
                .orElseThrow(() -> new RecursoNoEncontradoException("El cupón ingresado no existe."));

        if (Boolean.FALSE.equals(cupon.getActivo())) {
            throw new IllegalArgumentException("El cupón \"" + cupon.getCodigo() + "\" no está activo.");
        }
        if (cupon.getUsosMaximos() != null && cupon.getUsos() >= cupon.getUsosMaximos()) {
            throw new IllegalArgumentException("El cupón \"" + cupon.getCodigo() + "\" agotó su límite de usos.");
        }
        return cupon;
    }

    // Usado por el endpoint de "previsualizar" cupon desde el carrito.
    public CuponResponse validarResponse(String codigo) {
        return mapear(validarParaUso(codigo));
    }

    public void registrarUso(Cupon cupon) {
        cupon.setUsos((cupon.getUsos() == null ? 0 : cupon.getUsos()) + 1);
        cuponRepository.save(cupon);
    }

    // Al cancelar una orden devolvemos el uso del cupon para no consumirlo de mas.
    public void revertirUso(String codigo) {
        if (codigo == null) return;
        cuponRepository.findByCodigoIgnoreCase(normalizar(codigo)).ifPresent(cupon -> {
            cupon.setUsos(Math.max(0, (cupon.getUsos() == null ? 0 : cupon.getUsos()) - 1));
            cuponRepository.save(cupon);
        });
    }

    private String normalizar(String codigo) {
        return codigo == null ? "" : codigo.trim().toUpperCase();
    }

    private CuponResponse mapear(Cupon cupon) {
        return CuponResponse.builder()
                .idCupon(cupon.getIdCupon())
                .codigo(cupon.getCodigo())
                .embajador(cupon.getEmbajador())
                .porcentajeDescuento(cupon.getPorcentajeDescuento())
                .activo(cupon.getActivo())
                .usos(cupon.getUsos())
                .usosMaximos(cupon.getUsosMaximos())
                .fechaCreacion(cupon.getFechaCreacion())
                .build();
    }
}
