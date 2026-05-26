package com.uade.tpo.joyeria.service;

import com.uade.tpo.joyeria.dto.CarritoResponse;
import com.uade.tpo.joyeria.dto.ItemCarritoRequest;
import com.uade.tpo.joyeria.entity.Carrito;
import com.uade.tpo.joyeria.entity.ItemCarrito;
import com.uade.tpo.joyeria.entity.Producto;
import com.uade.tpo.joyeria.entity.Usuario;
import com.uade.tpo.joyeria.exception.RecursoNoEncontradoException;
import com.uade.tpo.joyeria.exception.StockInsuficienteException;
import com.uade.tpo.joyeria.repository.CarritoRepository;
import com.uade.tpo.joyeria.repository.ItemCarritoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

// Maneja el carrito de compras: agregar, modificar y eliminar items.
// Cada usuario solo puede ver y modificar su propio carrito (verificacion de ownership).
@Service
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final ItemCarritoRepository itemCarritoRepository;
    private final UsuarioService usuarioService;
    private final ProductoService productoService;

    public CarritoService(CarritoRepository carritoRepository,
                          ItemCarritoRepository itemCarritoRepository,
                          UsuarioService usuarioService,
                          ProductoService productoService) {
        this.carritoRepository = carritoRepository;
        this.itemCarritoRepository = itemCarritoRepository;
        this.usuarioService = usuarioService;
        this.productoService = productoService;
    }

    // Si el usuario no tiene carrito activo, se crea uno vacio automaticamente.
    public CarritoResponse obtenerCarrito(Long usuarioId) {
        Usuario usuario = usuarioService.obtenerPorId(usuarioId);
        Carrito carrito = obtenerOCrearCarritoActivo(usuario);
        return mapearAResponse(carrito);
    }

    // Logica upsert: si el producto ya esta en el carrito suma la cantidad, si no crea un item nuevo.
    // @Transactional garantiza atomicidad: si algo falla, se revierte todo.
    @Transactional
    public CarritoResponse agregarItem(Long usuarioId, ItemCarritoRequest request) {
        Usuario usuario = usuarioService.obtenerPorId(usuarioId);
        Producto producto = productoService.obtenerEntidadPorId(request.getProductoId());
        Carrito carrito = obtenerOCrearCarritoActivo(usuario);

        // Buscar si ya existe el producto en el carrito
        ItemCarrito itemExistente = itemCarritoRepository
                .findByCarritoAndProducto(carrito, producto)
                .orElse(null);

        int nuevaCantidad = request.getCantidad();
        if (itemExistente != null) {
            nuevaCantidad += itemExistente.getCantidad();
        }

        if (producto.getStock() < nuevaCantidad) {
            throw new StockInsuficienteException(
                    "Stock insuficiente para " + producto.getNombre() +
                    ". Disponible: " + producto.getStock() + 
                    (itemExistente != null ? " (Ya tienes " + itemExistente.getCantidad() + " en el carrito)" : ""));
        }

        if (itemExistente != null) {
            itemExistente.setCantidad(nuevaCantidad);
            itemCarritoRepository.save(itemExistente);
        } else {
            ItemCarrito nuevo = new ItemCarrito();
            nuevo.setCarrito(carrito);
            nuevo.setProducto(producto);
            nuevo.setCantidad(nuevaCantidad);
            itemCarritoRepository.save(nuevo);
        }

        return mapearAResponse(carritoRepository.findById(carrito.getIdCarrito()).orElseThrow());
    }

    // Verifica que el item pertenezca al usuario autenticado antes de modificarlo.
    @Transactional
    public CarritoResponse modificarItem(Long usuarioId, Long itemId, Integer nuevaCantidad) {
        ItemCarrito item = itemCarritoRepository.findById(itemId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Item no encontrado: " + itemId));

        // Devolvemos 404 (no 403) para no revelar que el item existe pero es de otro usuario.
        if (!item.getCarrito().getUsuario().getIdUsuario().equals(usuarioId)) {
            throw new RecursoNoEncontradoException("Item no encontrado: " + itemId);
        }

        if (item.getProducto().getStock() < nuevaCantidad) {
            throw new StockInsuficienteException("Stock insuficiente. Disponible: " + item.getProducto().getStock());
        }

        item.setCantidad(nuevaCantidad);
        itemCarritoRepository.save(item);

        return mapearAResponse(item.getCarrito());
    }

    @Transactional
    public CarritoResponse eliminarItem(Long usuarioId, Long itemId) {
        ItemCarrito item = itemCarritoRepository.findById(itemId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Item no encontrado: " + itemId));

        if (!item.getCarrito().getUsuario().getIdUsuario().equals(usuarioId)) {
            throw new RecursoNoEncontradoException("Item no encontrado: " + itemId);
        }

        Carrito carrito = item.getCarrito();
        carrito.getItems().remove(item);
        itemCarritoRepository.delete(item);

        return mapearAResponse(carrito);
    }

    // Visibilidad de paquete: OrdenService lo usa para obtener el carrito activo en el checkout.
    Carrito obtenerOCrearCarritoActivo(Usuario usuario) {
        return carritoRepository.findByUsuarioAndActivoTrue(usuario)
                .orElseGet(() -> {
                    Carrito nuevo = new Carrito();
                    nuevo.setUsuario(usuario);
                    nuevo.setActivo(true);
                    nuevo.setFechaCreacion(LocalDateTime.now());
                    return carritoRepository.save(nuevo);
                });
    }

    // Calcula subtotal por item y total del carrito al momento de mapear.
    private CarritoResponse mapearAResponse(Carrito carrito) {
        var items = carrito.getItems().stream()
                .map(item -> {
                    BigDecimal precioUnitario = item.getProducto().getPrecio();
                    BigDecimal subtotal = precioUnitario.multiply(BigDecimal.valueOf(item.getCantidad()));
                    return CarritoResponse.ItemCarritoResponse.builder()
                            .idItem(item.getIdItem())
                            .idProducto(item.getProducto().getIdProducto())
                            .nombreProducto(item.getProducto().getNombre())
                            .imagenUrl(item.getProducto().getImagenUrl())
                            .precioUnitario(precioUnitario)
                            .cantidad(item.getCantidad())
                            .subtotal(subtotal)
                            .build();
                })
                .collect(Collectors.toList());

        BigDecimal total = items.stream()
                .map(CarritoResponse.ItemCarritoResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CarritoResponse.builder()
                .idCarrito(carrito.getIdCarrito())
                .items(items)
                .total(total)
                .build();
    }
}
