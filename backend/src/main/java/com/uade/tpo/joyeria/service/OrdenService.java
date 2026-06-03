package com.uade.tpo.joyeria.service;

import com.uade.tpo.joyeria.dto.OrdenResponse;
import com.uade.tpo.joyeria.dto.CheckoutRequest;
import com.uade.tpo.joyeria.entity.*;
import com.uade.tpo.joyeria.exception.RecursoNoEncontradoException;
import com.uade.tpo.joyeria.exception.StockInsuficienteException;
import com.uade.tpo.joyeria.repository.OrdenRepository;
import com.uade.tpo.joyeria.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

// Maneja el checkout y el historial de ordenes.
// El checkout convierte el carrito en una orden permanente descontando stock y cerrando el carrito.
@Service
public class OrdenService {

    private final OrdenRepository ordenRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioService usuarioService;
    private final CarritoService carritoService;
    private final MailService mailService;

    public OrdenService(OrdenRepository ordenRepository,
                        ProductoRepository productoRepository,
                        UsuarioService usuarioService,
                        CarritoService carritoService,
                        MailService mailService) {
        this.ordenRepository = ordenRepository;
        this.productoRepository = productoRepository;
        this.usuarioService = usuarioService;
        this.carritoService = carritoService;
        this.mailService = mailService;
    }

    // @Transactional es critico: agrupa todas las operaciones en una sola transaccion.
    // Si algo falla (ej: stock insuficiente en el tercer item), se revierte todo. O todo pasa, o nada.
    // Pasos: validar carrito → validar stock → crear orden → descontar stock → cerrar carrito.
    @Transactional
    public OrdenResponse checkout(Long usuarioId, CheckoutRequest checkoutRequest) {
        Usuario usuario = usuarioService.obtenerPorId(usuarioId);
        Carrito carrito = carritoService.obtenerOCrearCarritoActivo(usuario);

        if (carrito.getItems().isEmpty()) {
            throw new RecursoNoEncontradoException("El carrito esta vacio");
        }

        // Validamos el stock de TODOS los items antes de modificar cualquier cosa.
        for (ItemCarrito item : carrito.getItems()) {
            if (item.getProducto().getStock() < item.getCantidad()) {
                throw new StockInsuficienteException(
                        "Stock insuficiente para: " + item.getProducto().getNombre() +
                        ". Disponible: " + item.getProducto().getStock() +
                        ", requerido: " + item.getCantidad());
            }
        }

        Orden orden = new Orden();
        orden.setUsuario(usuario);
        orden.setFecha(LocalDateTime.now());
        orden.setEstado("PENDIENTE");
        orden.setMetodoPago(checkoutRequest.getMetodoPago());
        orden.setNombreCompleto(checkoutRequest.getNombreCompleto());
        orden.setDireccion(checkoutRequest.getDireccion());
        orden.setCiudad(checkoutRequest.getCiudad());
        orden.setCodigoPostal(checkoutRequest.getCodigoPostal());
        orden.setTelefono(checkoutRequest.getTelefono());

        List<DetalleOrden> detalles = carrito.getItems().stream()
                .map(item -> {
                    Producto producto = item.getProducto();

                    producto.setStock(producto.getStock() - item.getCantidad());
                    productoRepository.save(producto);

                    DetalleOrden detalle = new DetalleOrden();
                    detalle.setOrden(orden);
                    detalle.setProducto(producto);
                    detalle.setCantidad(item.getCantidad());
                    
                    // Aplicar multiplicador del dispositivo si viene en el request
                    BigDecimal precioUnitario = producto.getPrecio();
                    if (checkoutRequest.getMultiplicadorDispositivo() != null) {
                        precioUnitario = precioUnitario.multiply(checkoutRequest.getMultiplicadorDispositivo())
                                .setScale(2, java.math.RoundingMode.HALF_UP);
                    }
                    detalle.setPrecioUnitario(precioUnitario);
                    return detalle;
                })
                .collect(Collectors.toList());

        orden.setDetalles(detalles);

        BigDecimal total = detalles.stream()
                .map(d -> d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        orden.setTotal(total);

        // Cerramos el carrito. La proxima compra arranca con uno nuevo.
        carrito.setActivo(false);

        Orden guardada = ordenRepository.save(orden);

        // Intentamos enviar el mail de confirmación
        try {
            mailService.enviarConfirmacionCompra(usuario.getEmail(), guardada);
        } catch (Exception e) {
            System.err.println("Error al enviar email de confirmacion de orden: " + e.getMessage());
        }

        return mapearAResponse(guardada);
    }

    // El ID del usuario sale del token, garantizando que cada usuario solo ve sus propias ordenes.
    public List<OrdenResponse> listarPorUsuario(Long usuarioId) {
        Usuario usuario = usuarioService.obtenerPorId(usuarioId);
        return ordenRepository.findByUsuario(usuario).stream()
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    // Si la orden existe pero es de otro usuario, devolvemos 404 para no revelar que existe (a menos que sea ADMIN o MODERATOR).
    public OrdenResponse obtenerPorId(Long ordenId, Long usuarioId, String rolUsuario) {
        Orden orden = ordenRepository.findById(ordenId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Orden no encontrada: " + ordenId));

        if (!rolUsuario.equals("ADMIN") && !rolUsuario.equals("MODERATOR") && !orden.getUsuario().getIdUsuario().equals(usuarioId)) {
            throw new RecursoNoEncontradoException("Orden no encontrada: " + ordenId);
        }

        return mapearAResponse(orden);
    }

    public List<OrdenResponse> listarTodas() {
        return ordenRepository.findAll().stream()
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrdenResponse actualizarEstado(Long ordenId, String nuevoEstado) {
        Orden orden = ordenRepository.findById(ordenId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Orden no encontrada: " + ordenId));
        
        String oldEstado = orden.getEstado();
        
        if (!"CANCELADO".equals(oldEstado) && "CANCELADO".equals(nuevoEstado)) {
            for (DetalleOrden detalle : orden.getDetalles()) {
                Producto prod = detalle.getProducto();
                prod.setStock(prod.getStock() + detalle.getCantidad());
                productoRepository.save(prod);
            }
        } else if ("CANCELADO".equals(oldEstado) && !"CANCELADO".equals(nuevoEstado)) {
            for (DetalleOrden detalle : orden.getDetalles()) {
                Producto prod = detalle.getProducto();
                if (prod.getStock() < detalle.getCantidad()) {
                    throw new StockInsuficienteException(
                            "No se puede reactivar la orden. Stock insuficiente para: " + prod.getNombre() +
                            ". Disponible: " + prod.getStock() + ", requerido: " + detalle.getCantidad());
                }
                prod.setStock(prod.getStock() - detalle.getCantidad());
                productoRepository.save(prod);
            }
        }

        orden.setEstado(nuevoEstado);
        return mapearAResponse(ordenRepository.save(orden));
    }

    private OrdenResponse mapearAResponse(Orden orden) {
        var detalles = orden.getDetalles().stream()
                .map(d -> OrdenResponse.DetalleOrdenResponse.builder()
                        .idDetalle(d.getIdDetalle())
                        .nombreProducto(d.getProducto().getNombre())
                        .cantidad(d.getCantidad())
                        .precioUnitario(d.getPrecioUnitario())
                        // El subtotal se calcula al mapear, no se guarda en la BD.
                        .subtotal(d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad())))
                        .build())
                .collect(Collectors.toList());

        return OrdenResponse.builder()
                .idOrden(orden.getIdOrden())
                .fecha(orden.getFecha())
                .estado(orden.getEstado())
                .total(orden.getTotal())
                .usuario(orden.getUsuario().getNombre())
                .metodoPago(orden.getMetodoPago())
                .nombreCompleto(orden.getNombreCompleto())
                .direccion(orden.getDireccion())
                .ciudad(orden.getCiudad())
                .codigoPostal(orden.getCodigoPostal())
                .telefono(orden.getTelefono())
                .detalles(detalles)
                .build();
    }
}
