package com.uade.tpo.joyeria.repository;

import com.uade.tpo.joyeria.entity.Carrito;
import com.uade.tpo.joyeria.entity.ItemCarrito;
import com.uade.tpo.joyeria.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ItemCarritoRepository extends JpaRepository<ItemCarrito, Long> {

    // Upsert: si el producto ya esta en el carrito se suma la cantidad; si no, se crea un item nuevo.
    Optional<ItemCarrito> findByCarritoAndProducto(Carrito carrito, Producto producto);
}
