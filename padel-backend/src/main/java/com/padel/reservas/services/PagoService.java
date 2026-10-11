package com.padel.reservas.services;

import com.padel.reservas.entities.MetodoPago;
import com.padel.reservas.entities.Pago;
import com.padel.reservas.entities.Reserva;
import com.padel.reservas.entities.TipoPago;
import com.padel.reservas.repositories.PagoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PagoService {

    private final PagoRepository pagoRepository;
    private final ConfiguracionClubService configuracionClubService;

    public Pago registrarCobro(Reserva reserva, MetodoPago metodo) {
        BigDecimal importe = reserva.getCosteEstimado();
        if (importe == null) {
            log.warn("El coste estimado de la reserva {} es null. Usando 0.", reserva.getCodigoReserva());
            importe = BigDecimal.ZERO;
        }

        long minutos = Duration.between(reserva.getHoraInicio(), reserva.getHoraFin()).toMinutes();
        String concepto = "Reserva " + reserva.getCodigoReserva() + " · Pista " + reserva.getPista().getNumeroPista() + " · " + minutos + " min";

        Pago pago = Pago.builder()
                .reserva(reserva)
                .usuario(reserva.getUsuario())
                .tipo(TipoPago.COBRO)
                .metodo(metodo)
                .importe(importe)
                .fechaPago(LocalDateTime.now())
                .concepto(concepto)
                .build();

        return pagoRepository.save(pago);
    }

    public BigDecimal calcularImporteReembolso(Reserva reserva, boolean esAdminIniciado, boolean aplicarTramos) {
        List<Pago> pagos = pagoRepository.findByReservaId(reserva.getId());
        Pago cobroOriginal = pagos.stream()
                .filter(p -> p.getTipo() == TipoPago.COBRO)
                .findFirst()
                .orElse(null);

        if (cobroOriginal == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal importeCobro = cobroOriginal.getImporte();

        if (esAdminIniciado && !aplicarTramos) {
            return importeCobro;
        }

        LocalDateTime inicioReserva = LocalDateTime.of(reserva.getFechaReserva(), reserva.getHoraInicio());
        long minutosHastaInicio = Duration.between(LocalDateTime.now(), inicioReserva).toMinutes();

        // ponytail: candidato a ConfiguracionClub
        long horasCancelacionGratuita = configuracionClubService.getConfiguracion().getHorasCancelacionGratuita();
        long minutosCancelacionGratuita = horasCancelacionGratuita * 60;
        long minutosTramoParcial = 360; // 6 horas
        BigDecimal porcentajeTramoParcial = new BigDecimal("0.50");

        if (minutosHastaInicio > minutosCancelacionGratuita) {
            return importeCobro;
        }
        if (minutosHastaInicio >= minutosTramoParcial) {
            return importeCobro.multiply(porcentajeTramoParcial);
        }
        return BigDecimal.ZERO;
    }

    public Pago registrarReembolso(Reserva reserva, BigDecimal importe, MetodoPago metodo) {
        if (importe.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        String concepto = "Reembolso reserva " + reserva.getCodigoReserva();

        Pago pago = Pago.builder()
                .reserva(reserva)
                .usuario(reserva.getUsuario())
                .tipo(TipoPago.REEMBOLSO)
                .metodo(metodo)
                .importe(importe)
                .fechaPago(LocalDateTime.now())
                .concepto(concepto)
                .build();

        return pagoRepository.save(pago);
    }

    public void registrarAjusteEdicion(Reserva reservaAntes, BigDecimal costeNuevo) {
        BigDecimal costeAntes = reservaAntes.getCosteEstimado();
        if (costeAntes == null) {
            costeAntes = BigDecimal.ZERO;
        }
        if (costeNuevo == null) {
            costeNuevo = BigDecimal.ZERO;
        }

        BigDecimal diferencia = costeNuevo.subtract(costeAntes);

        if (diferencia.compareTo(BigDecimal.ZERO) == 0) {
            return;
        }

        List<Pago> pagos = pagoRepository.findByReservaId(reservaAntes.getId());
        Pago cobroOriginal = pagos.stream()
                .filter(p -> p.getTipo() == TipoPago.COBRO)
                .findFirst()
                .orElse(null);

        MetodoPago metodo = (cobroOriginal != null) ? cobroOriginal.getMetodo() : MetodoPago.TARJETA_SIMULADA;

        if (diferencia.compareTo(BigDecimal.ZERO) > 0) {
            Pago pago = Pago.builder()
                    .reserva(reservaAntes) // La entidad Reserva actual servirá
                    .usuario(reservaAntes.getUsuario())
                    .tipo(TipoPago.COBRO)
                    .metodo(metodo)
                    .importe(diferencia)
                    .fechaPago(LocalDateTime.now())
                    .concepto("Ajuste por modificación · Reserva " + reservaAntes.getCodigoReserva())
                    .build();
            pagoRepository.save(pago);
        } else {
            Pago pago = Pago.builder()
                    .reserva(reservaAntes)
                    .usuario(reservaAntes.getUsuario())
                    .tipo(TipoPago.REEMBOLSO)
                    .metodo(metodo)
                    .importe(diferencia.abs())
                    .fechaPago(LocalDateTime.now())
                    .concepto("Ajuste por modificación · Reserva " + reservaAntes.getCodigoReserva())
                    .build();
            pagoRepository.save(pago);
        }
    }
}
