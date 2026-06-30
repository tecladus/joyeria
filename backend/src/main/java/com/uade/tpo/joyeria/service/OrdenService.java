package com.uade.tpo.joyeria.service;

import com.uade.tpo.joyeria.dto.OrdenResponse;
import com.uade.tpo.joyeria.dto.CheckoutRequest;
import com.uade.tpo.joyeria.entity.*;
import com.uade.tpo.joyeria.exception.RecursoNoEncontradoException;
import com.uade.tpo.joyeria.exception.StockInsuficienteException;
import com.uade.tpo.joyeria.repository.OrdenRepository;
import com.uade.tpo.joyeria.repository.ProductoRepository;
import com.uade.tpo.joyeria.repository.PagoRepository;
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
    private final PagoRepository pagoRepository;
    private final MercadoPagoService mercadoPagoService;
    private final CuponService cuponService;
    private final PuntosService puntosService;

    public OrdenService(OrdenRepository ordenRepository,
                        ProductoRepository productoRepository,
                        UsuarioService usuarioService,
                        CarritoService carritoService,
                        MailService mailService,
                        PagoRepository pagoRepository,
                        MercadoPagoService mercadoPagoService,
                        CuponService cuponService,
                        PuntosService puntosService) {
        this.ordenRepository = ordenRepository;
        this.productoRepository = productoRepository;
        this.usuarioService = usuarioService;
        this.carritoService = carritoService;
        this.mailService = mailService;
        this.pagoRepository = pagoRepository;
        this.mercadoPagoService = mercadoPagoService;
        this.cuponService = cuponService;
        this.puntosService = puntosService;
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

        BigDecimal subtotal = detalles.stream()
                .map(d -> d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Total provisional = subtotal. Lo guardamos primero para que la orden tenga ID
        // (los movimientos de puntos referencian la orden ya persistida).
        orden.setSubtotal(subtotal);
        orden.setTotal(subtotal);
        Orden guardada = ordenRepository.save(orden);

        // Aplica cupon de embajador y canje de puntos; ajusta el total final.
        aplicarPromociones(usuario, guardada, subtotal, checkoutRequest);
        guardada = ordenRepository.save(guardada);

        // En el flujo directo (tarjeta/transferencia/efectivo) los puntos se acreditan al instante.
        otorgarPuntosGanados(usuario, guardada);

        // Cerramos el carrito. La proxima compra arranca con uno nuevo.
        carrito.setActivo(false);

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
            // Revertir promociones: liberar el uso del cupon, devolver los puntos canjeados
            // y quitar los puntos que la compra habia otorgado.
            // (Nota: una posterior reactivacion de la orden no vuelve a aplicar estas promociones.)
            revertirPromociones(orden);
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

    @Transactional
    public String checkoutMercadoPago(Long usuarioId, CheckoutRequest checkoutRequest) {
        Usuario usuario = usuarioService.obtenerPorId(usuarioId);
        Carrito carrito = carritoService.obtenerOCrearCarritoActivo(usuario);

        if (carrito.getItems().isEmpty()) {
            throw new RecursoNoEncontradoException("El carrito esta vacio");
        }

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
        orden.setEstado("PENDIENTE_PAGO");
        orden.setMetodoPago("MERCADO_PAGO");
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

        BigDecimal subtotal = detalles.stream()
                .map(d -> d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        orden.setSubtotal(subtotal);
        orden.setTotal(subtotal);
        Orden guardada = ordenRepository.save(orden);

        // Aplica cupon y canje de puntos para que Mercado Pago cobre el monto ya descontado.
        // Los puntos GANADOS se acreditan recien al confirmarse el pago (confirmarPagoOrden).
        aplicarPromociones(usuario, guardada, subtotal, checkoutRequest);
        guardada = ordenRepository.save(guardada);

        carrito.setActivo(false);

        String descripcion = "Compra en Aura Joyería - Orden #" + guardada.getIdOrden();
        return mercadoPagoService.crearPreferenciaPago(guardada.getIdOrden(), descripcion, guardada.getTotal());
    }

    @Transactional
    public OrdenResponse confirmarPagoOrden(Long ordenId, String status) {
        Orden orden = ordenRepository.findById(ordenId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Orden no encontrada: " + ordenId));

        if ("PENDIENTE_PAGO".equals(orden.getEstado())) {
            if ("approved".equals(status) || "success".equals(status)) {
                orden.setEstado("PENDIENTE");
                Orden guardada = ordenRepository.save(orden);

                Pago pago = new Pago();
                pago.setMetodo("MERCADO_PAGO");
                pago.setEstado("APROBADO");
                pago.setFecha(LocalDateTime.now());
                pago.setOrden(guardada);
                pagoRepository.save(pago);

                // Recien ahora que el pago fue aprobado acreditamos los puntos de la compra.
                otorgarPuntosGanados(guardada.getUsuario(), guardada);

                try {
                    mailService.enviarConfirmacionCompra(orden.getUsuario().getEmail(), guardada);
                } catch (Exception e) {
                    System.err.println("Error al enviar email de confirmacion de orden MP: " + e.getMessage());
                }
                return mapearAResponse(guardada);
            } else if ("failure".equals(status) || "rejected".equals(status)) {
                return actualizarEstado(ordenId, "CANCELADO");
            }
        }
        return mapearAResponse(orden);
    }

    // Aplica el cupon de embajador y el canje de puntos sobre una orden ya persistida.
    // Setea el desglose (subtotal, descuentos) y el total final. NO acredita puntos ganados.
    private void aplicarPromociones(Usuario usuario, Orden orden, BigDecimal subtotal, CheckoutRequest req) {
        BigDecimal descuentoCupon = BigDecimal.ZERO;
        BigDecimal descuentoPuntos = BigDecimal.ZERO;

        // 1) Cupon de embajador → descuento porcentual sobre el subtotal.
        if (req.getCodigoCupon() != null && !req.getCodigoCupon().isBlank()) {
            var cupon = cuponService.validarParaUso(req.getCodigoCupon());
            descuentoCupon = subtotal
                    .multiply(BigDecimal.valueOf(cupon.getPorcentajeDescuento()))
                    .divide(BigDecimal.valueOf(100))
                    .setScale(2, java.math.RoundingMode.HALF_UP);
            cuponService.registrarUso(cupon);
            orden.setCuponCodigo(cupon.getCodigo());
            orden.setDescuentoCupon(descuentoCupon);
        }

        BigDecimal baseLuegoCupon = subtotal.subtract(descuentoCupon);

        // 2) Canje de puntos → descuento en dinero (no puede superar lo que queda a pagar).
        Integer puntos = req.getPuntosACanjear();
        if (puntos != null && puntos > 0) {
            descuentoPuntos = puntosService.calcularDescuentoPorPuntos(puntos);
            if (descuentoPuntos.compareTo(baseLuegoCupon) > 0) {
                throw new IllegalArgumentException(
                        "El descuento por puntos supera el monto a pagar. Canjeá menos puntos.");
            }
            puntosService.canjearPuntos(usuario, orden, puntos, "Canje de puntos en orden #" + orden.getIdOrden());
            orden.setPuntosCanjeados(puntos);
            orden.setDescuentoPuntos(descuentoPuntos);
        }

        BigDecimal total = subtotal.subtract(descuentoCupon).subtract(descuentoPuntos);
        if (total.signum() < 0) total = BigDecimal.ZERO;
        orden.setTotal(total);
    }

    // Acredita al comprador los puntos que genero la compra (1 punto por cada $1 del total pagado).
    private void otorgarPuntosGanados(Usuario usuario, Orden orden) {
        int ganados = puntosService.calcularPuntosGanados(orden.getTotal());
        if (ganados <= 0) return;
        orden.setPuntosGanados(ganados);
        ordenRepository.save(orden);
        puntosService.otorgarPuntos(usuario, orden, ganados, "Puntos por compra (orden #" + orden.getIdOrden() + ")");
    }

    // Deshace las promociones de una orden cancelada.
    private void revertirPromociones(Orden orden) {
        Usuario usuario = orden.getUsuario();

        if (orden.getCuponCodigo() != null) {
            cuponService.revertirUso(orden.getCuponCodigo());
        }
        if (orden.getPuntosCanjeados() != null && orden.getPuntosCanjeados() > 0) {
            puntosService.reintegrarPuntos(usuario, orden.getPuntosCanjeados(),
                    "Reintegro de puntos por cancelación de orden #" + orden.getIdOrden());
        }
        if (orden.getPuntosGanados() != null && orden.getPuntosGanados() > 0) {
            puntosService.quitarPuntosGanados(usuario, orden.getPuntosGanados(),
                    "Reversa de puntos por cancelación de orden #" + orden.getIdOrden());
        }
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
                .subtotal(orden.getSubtotal())
                .cuponCodigo(orden.getCuponCodigo())
                .descuentoCupon(orden.getDescuentoCupon())
                .puntosCanjeados(orden.getPuntosCanjeados())
                .descuentoPuntos(orden.getDescuentoPuntos())
                .puntosGanados(orden.getPuntosGanados())
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
