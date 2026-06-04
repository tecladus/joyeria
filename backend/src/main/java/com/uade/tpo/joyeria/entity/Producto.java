package com.uade.tpo.joyeria.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Long idProducto;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    // BigDecimal para precision monetaria exacta (double/float tienen errores de punto flotante).
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;

    @Column(precision = 5, scale = 2)
    private BigDecimal descuento;

    // Stock = 0 oculta el producto en ProductoRepository.findByStockGreaterThan(0).
    @Column(nullable = false)
    private Integer stock;

    @Column(name = "imagen_url", length = 255)
    private String imagenUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    // Solo este vendedor puede modificar o eliminar el producto (verificado en ProductoService).
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vendedor_id", nullable = false)
    private Usuario vendedor;

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemCarrito> itemsCarrito = new ArrayList<>();

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleOrden> detallesOrden = new ArrayList<>();
}
