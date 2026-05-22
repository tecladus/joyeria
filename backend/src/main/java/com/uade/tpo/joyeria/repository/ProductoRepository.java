package com.uade.tpo.joyeria.repository;

import com.uade.tpo.joyeria.entity.Producto;
import com.uade.tpo.joyeria.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    // Productos visibles para compradores: stock > 0.
    List<Producto> findByStockGreaterThan(int stock);

    // Filtra por categoria + stock > 0.
    List<Producto> findByCategoriaIdCategoriaAndStockGreaterThan(Long categoriaId, int stock);

    // Filtra por rango de precio + stock > 0.
    List<Producto> findByPrecioBetweenAndStockGreaterThan(BigDecimal precioMin, BigDecimal precioMax, int stock);

    List<Producto> findByVendedor(Usuario vendedor);
}
