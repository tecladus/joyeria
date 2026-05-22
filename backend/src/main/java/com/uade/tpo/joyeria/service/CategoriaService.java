package com.uade.tpo.joyeria.service;

import com.uade.tpo.joyeria.dto.CategoriaRequest;
import com.uade.tpo.joyeria.dto.CategoriaResponse;
import com.uade.tpo.joyeria.entity.Categoria;
import com.uade.tpo.joyeria.exception.CategoriaDuplicadaException;
import com.uade.tpo.joyeria.exception.RecursoNoEncontradoException;
import com.uade.tpo.joyeria.repository.CategoriaRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

// CRUD de categorias. Nunca expone entidades hacia afuera, siempre convierte a DTOs.
@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    public List<CategoriaResponse> listarTodas() {
        return categoriaRepository.findAll().stream()
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    public CategoriaResponse obtenerPorId(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoria no encontrada: " + id));
        return mapearAResponse(categoria);
    }

    // Doble validacion de nombre unico: a nivel app (error amigable) y constraint en BD (concurrencia).
    public CategoriaResponse crear(CategoriaRequest request) {
        if (categoriaRepository.existsByNombre(request.getNombre())) {
            throw new CategoriaDuplicadaException("Ya existe una categoria con ese nombre: " + request.getNombre());
        }
        Categoria categoria = new Categoria();
        categoria.setNombre(request.getNombre());
        return mapearAResponse(categoriaRepository.save(categoria));
    }

    // save() con entidad que ya tiene ID hace UPDATE, sin ID hace INSERT.
    public CategoriaResponse actualizar(Long id, CategoriaRequest request) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoria no encontrada: " + id));
        categoria.setNombre(request.getNombre());
        return mapearAResponse(categoriaRepository.save(categoria));
    }

    public void eliminar(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Categoria no encontrada: " + id);
        }
        categoriaRepository.deleteById(id);
    }

    // Visibilidad de paquete: ProductoService necesita la entidad, no el DTO.
    Categoria obtenerEntidadPorId(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoria no encontrada: " + id));
    }

    private CategoriaResponse mapearAResponse(Categoria categoria) {
        return CategoriaResponse.builder()
                .idCategoria(categoria.getIdCategoria())
                .nombre(categoria.getNombre())
                .build();
    }
}
