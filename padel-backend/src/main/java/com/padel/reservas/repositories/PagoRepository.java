package com.padel.reservas.repositories;

import com.padel.reservas.entities.Pago;
import com.padel.reservas.entities.TipoPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByReservaId(Long reservaId);
    List<Pago> findByUsuarioId(Long usuarioId);

    @Query("SELECT COALESCE(SUM(p.importe), 0) FROM Pago p " +
           "WHERE p.tipo = :tipo " +
           "AND p.fechaPago >= :desde AND p.fechaPago < :hasta")
    BigDecimal sumImporteByTipoAndPeriodo(
        @Param("tipo") TipoPago tipo,
        @Param("desde") LocalDateTime desde,
        @Param("hasta") LocalDateTime hasta);

    @Query("SELECT p FROM Pago p " +
           "JOIN FETCH p.reserva r JOIN FETCH r.pista " +
           "WHERE p.fechaPago >= :desde AND p.fechaPago < :hasta " +
           "ORDER BY p.fechaPago ASC")
    List<Pago> findAllConReservaYPistaEnPeriodo(
        @Param("desde") LocalDateTime desde,
        @Param("hasta") LocalDateTime hasta);
}
