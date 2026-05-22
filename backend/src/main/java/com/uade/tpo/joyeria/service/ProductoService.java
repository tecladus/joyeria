package com.uade.tpo.joyeria.service;

import com.uade.tpo.joyeria.dto.ProductoRequest;
import com.uade.tpo.joyeria.dto.ProductoResponse;
import com.uade.tpo.joyeria.entity.Categoria;
import com.uade.tpo.joyeria.entity.Producto;
import com.uade.tpo.joyeria.entity.Usuario;
import com.uade.tpo.joyeria.exception.AccesoDenegadoException;
import com.uade.tpo.joyeria.exception.RecursoNoEncontradoException;
import com.uade.tpo.joyeria.repository.ProductoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

// CRUD de productos con reglas de negocio:
//   - Solo VENDEDORES pueden crear/modificar/eliminar.
//   - Cada vendedor solo puede tocar sus propios productos.
//   - Solo productos con stock > 0 son visibles para compradores.
@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaService categoriaService;
    private final UsuarioService usuarioService;

    public ProductoService(ProductoRepository productoRepository,
                           CategoriaService categoriaService,
                           UsuarioService usuarioService) {
        this.productoRepository = productoRepository;
        this.categoriaService = categoriaService;
        this.usuarioService = usuarioService;
    }

    // El filtro de stock > 0 se hace en la BD, no en memoria, para mayor eficiencia.
    public List<ProductoResponse> listarDisponibles() {
        return productoRepository.findByStockGreaterThan(0).stream()
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    public List<ProductoResponse> listarPorCategoria(Long categoriaId) {
        return productoRepository.findByCategoriaIdCategoriaAndStockGreaterThan(categoriaId, 0).stream()
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    public List<ProductoResponse> listarPorRangoDePrecio(java.math.BigDecimal precioMin, java.math.BigDecimal precioMax) {
        return productoRepository.findByPrecioBetweenAndStockGreaterThan(precioMin, precioMax, 0).stream()
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    public ProductoResponse obtenerPorId(Long id) {
        Producto producto = obtenerEntidadPorId(id);
        return mapearAResponse(producto);
    }

    // El vendedorId viene del token JWT, no del body, para evitar que se falsifique.
    // Doble verificacion de rol: SecurityConfig lo bloquea a nivel HTTP y el service como segunda capa.
    public ProductoResponse crear(Long vendedorId, ProductoRequest request) {
        Usuario vendedor = usuarioService.obtenerPorId(vendedorId);

        if (!vendedor.getRol().getNombre().equals("VENDEDOR")) {
            throw new AccesoDenegadoException("Solo los vendedores pueden crear productos");
        }

        Categoria categoria = categoriaService.obtenerEntidadPorId(request.getCategoriaId());

        Producto producto = new Producto();
        producto.setNombre(request.getNombre());
        producto.setDescripcion(request.getDescripcion());
        producto.setPrecio(request.getPrecio());
        producto.setDescuento(request.getDescuento());
        producto.setStock(request.getStock());
        producto.setImagenUrl(request.getImagenUrl());
        producto.setCategoria(categoria);
        producto.setVendedor(vendedor);

        return mapearAResponse(productoRepository.save(producto));
    }

    // Verifica ownership: solo el vendedor que creo el producto puede modificarlo.
    public ProductoResponse actualizar(Long vendedorId, Long productoId, ProductoRequest request) {
        Producto producto = obtenerEntidadPorId(productoId);

        if (!producto.getVendedor().getIdUsuario().equals(vendedorId)) {
            throw new AccesoDenegadoException("Solo puedes modificar tus propios productos");
        }

        Categoria categoria = categoriaService.obtenerEntidadPorId(request.getCategoriaId());

        producto.setNombre(request.getNombre());
        producto.setDescripcion(request.getDescripcion());
        producto.setPrecio(request.getPrecio());
        producto.setDescuento(request.getDescuento());
        producto.setStock(request.getStock());
        producto.setImagenUrl(request.getImagenUrl());
        producto.setCategoria(categoria);

        return mapearAResponse(productoRepository.save(producto));
    }

    public void eliminar(Long vendedorId, Long productoId) {
        Producto producto = obtenerEntidadPorId(productoId);

        if (!producto.getVendedor().getIdUsuario().equals(vendedorId)) {
            throw new AccesoDenegadoException("Solo puedes eliminar tus propios productos");
        }

        productoRepository.deleteById(productoId);
    }

    public ProductoResponse aplicarDescuento(Long vendedorId, Long productoId, java.math.BigDecimal descuento) {
        Producto producto = obtenerEntidadPorId(productoId);

        if (!producto.getVendedor().getIdUsuario().equals(vendedorId)) {
            throw new AccesoDenegadoException("Solo puedes modificar tus propios productos");
        }

        producto.setDescuento(descuento);
        return mapearAResponse(productoRepository.save(producto));
    }

    // Visibilidad de paquete: CarritoService y OrdenService necesitan la entidad, no el DTO.
    Producto obtenerEntidadPorId(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado: " + id));
    }

    // Categoria y vendedor se mapean a String para evitar bucles de serializacion de Jackson.
    private ProductoResponse mapearAResponse(Producto producto) {
        return ProductoResponse.builder()
                .idProducto(producto.getIdProducto())
                .nombre(producto.getNombre())
                .descripcion(producto.getDescripcion())
                .precio(producto.getPrecio())
                .descuento(producto.getDescuento())
                .stock(producto.getStock())
                .imagenUrl(producto.getImagenUrl())
                .categoria(producto.getCategoria().getNombre())
                .vendedor(producto.getVendedor().getNombre())
                .build();
    }
}
