package com.padel.reservas.controller;

import com.padel.reservas.dto.ContabilidadDTO;
import com.padel.reservas.dto.UpdateConfiguracionDTO;
import com.padel.reservas.entities.ConfiguracionClub;
import com.padel.reservas.entities.EstadoReserva;
import com.padel.reservas.entities.Pago;
import com.padel.reservas.entities.TipoPago;
import com.padel.reservas.repositories.PagoRepository;
import com.padel.reservas.repositories.ReservaRepository;
import com.padel.reservas.services.ConfiguracionClubService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AdminController {

    private final ConfiguracionClubService configuracionService;
    private final PagoRepository pagoRepository;
    private final ReservaRepository reservaRepository;

    @GetMapping("/admin/contabilidad")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContabilidadDTO> getContabilidad(
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {

      LocalDate desdeEfectivo = desde != null ? desde : LocalDate.now().minusDays(30);
      LocalDate hastaEfectiva = hasta != null ? hasta : LocalDate.now();
      LocalDateTime desdeTs = desdeEfectivo.atStartOfDay();
      LocalDateTime hastaTs = hastaEfectiva.plusDays(1).atStartOfDay();

      BigDecimal brutos = pagoRepository.sumImporteByTipoAndPeriodo(
          TipoPago.COBRO, desdeTs, hastaTs);
      BigDecimal reembolsos = pagoRepository.sumImporteByTipoAndPeriodo(
          TipoPago.REEMBOLSO, desdeTs, hastaTs);
      BigDecimal netos = brutos.subtract(reembolsos);

      long confirmadas = reservaRepository.countByEstadoAndFechaReservaBetween(
          EstadoReserva.CONFIRMADA, desdeEfectivo, hastaEfectiva);
      long canceladas = reservaRepository.countByEstadoAndFechaReservaBetween(
          EstadoReserva.CANCELADA, desdeEfectivo, hastaEfectiva);
      long total = confirmadas + canceladas;
      double tasa = total > 0 ? (canceladas * 100.0 / total) : 0.0;

      return ResponseEntity.ok(new ContabilidadDTO(
          brutos, reembolsos, netos, confirmadas, canceladas, tasa));
    }

    @GetMapping("/admin/contabilidad/csv")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> getContabilidadCsv(
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {

      LocalDate desdeEfectivo = desde != null ? desde : LocalDate.now().minusDays(30);
      LocalDate hastaEfectiva = hasta != null ? hasta : LocalDate.now();
      LocalDateTime desdeTs = desdeEfectivo.atStartOfDay();
      LocalDateTime hastaTs = hastaEfectiva.plusDays(1).atStartOfDay();

      List<Pago> pagos = pagoRepository.findAllConReservaYPistaEnPeriodo(desdeTs, hastaTs);

      StringBuilder csv = new StringBuilder();
      csv.append("id,tipo,metodo,importe,fechaPago,concepto,codigoReserva,numeroPista\n");
      for (Pago p : pagos) {
        csv.append(p.getId()).append(',')
           .append(p.getTipo()).append(',')
           .append(p.getMetodo()).append(',')
           .append(p.getImporte()).append(',')
           .append(p.getFechaPago()).append(',')
           .append('"').append(
               p.getConcepto() != null
               ? p.getConcepto().replace("\"", "\"\"")
               : "").append('"').append(',')
           .append(p.getReserva().getCodigoReserva()).append(',')
           .append(p.getReserva().getPista().getNumeroPista()).append('\n');
      }

      String filename = "contabilidad-" + desdeEfectivo + "-" + hastaEfectiva + ".csv";
      return ResponseEntity.ok()
          .header("Content-Type", "text/csv; charset=UTF-8")
          .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
          .body(csv.toString());
    }

    @GetMapping("/admin/configuracion")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConfiguracionClub> getConfiguracion() {
        return ResponseEntity.ok(configuracionService.getConfiguracion());
    }

    @PutMapping("/admin/configuracion")
    @PreAuthorize("hasRole('ADMIN')")
    @com.padel.reservas.config.NoDemoAdmin
    public ResponseEntity<ConfiguracionClub> actualizarConfiguracion(
            @RequestBody UpdateConfiguracionDTO dto) {
        return ResponseEntity.ok(configuracionService.actualizar(dto));
    }

    // Endpoint público — solo devuelve las duraciones para el formulario
    // de reserva del frontend, sin exponer el resto de la configuración
    @GetMapping("/configuracion/duraciones")
    public ResponseEntity<Map<String, Object>> getDuraciones() {
        ConfiguracionClub config = configuracionService.getConfiguracion();
        return ResponseEntity.ok(Map.of(
            "duracionesPermitidas", config.getDuracionesPermitidas(),
            "duracionPorDefecto", config.getDuracionPorDefectoMinutos()
        ));
    }
}
