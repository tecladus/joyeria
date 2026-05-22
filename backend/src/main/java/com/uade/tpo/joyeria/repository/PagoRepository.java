package com.uade.tpo.joyeria.repository;

import com.uade.tpo.joyeria.entity.Orden;
import com.uade.tpo.joyeria.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PagoRepository extends JpaRepository<Pago, Long> {

    Optional<Pago> findByOrden(Orden orden);
}
