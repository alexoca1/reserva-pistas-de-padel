package com.padel.reservas.seed;

import com.padel.reservas.entities.Pista;
import com.padel.reservas.repositories.PistaRepository;
import com.padel.reservas.repositories.ReservaRepository;
import com.padel.reservas.repositories.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import com.padel.reservas.entities.Pago;
import com.padel.reservas.entities.TipoPago;
import com.padel.reservas.entities.MetodoPago;
import com.padel.reservas.entities.EstadoReserva;
import com.padel.reservas.entities.Reserva;
import com.padel.reservas.repositories.PagoRepository;

/**
 * Seeder de datos de demostración para entornos de desarrollo y pruebas.
 * Se activa únicamente cuando app.seed.demo=true.
 * Idempotente: si detecta usuarios existentes con @seed.invalid omite la carga.
 */
@Component
@ConditionalOnProperty(name = "app.seed.demo", havingValue = "true")
public class DemoDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);
    private static final String SEED_DOMAIN_SUFFIX = "@seed.invalid";

    private final UsuarioRepository usuarioRepository;
    private final PistaRepository pistaRepository;
    private final ReservaRepository reservaRepository;
    private final PagoRepository pagoRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoDataSeeder(
            UsuarioRepository usuarioRepository,
            PistaRepository pistaRepository,
            ReservaRepository reservaRepository,
            PagoRepository pagoRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.pistaRepository = pistaRepository;
        this.reservaRepository = reservaRepository;
        this.pagoRepository = pagoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("[DemoDataSeeder] Evaluando necesidad de siembra de datos demo...");

        // 1. Verificación de idempotencia
        long usuariosSeedExistentes = usuarioRepository.countByEmailEndingWith(SEED_DOMAIN_SUFFIX);
        if (usuariosSeedExistentes > 0) {
            log.info("[DemoDataSeeder] Ya existen {} usuarios con '{}'. Se omite la siembra por idempotencia.",
                    usuariosSeedExistentes, SEED_DOMAIN_SUFFIX);
            return;
        }

        // 2. Obtener pistas disponibles
        List<Pista> pistas = pistaRepository.findAll();
        if (pistas.isEmpty()) {
            log.warn("[DemoDataSeeder] No se encontraron pistas en la base de datos. Se omite la siembra.");
            return;
        }

        log.info("[DemoDataSeeder] Generando plan de datos de demo determinista...");
        String encodedPassword = passwordEncoder.encode("DemoUser2026!");
        DemoDataPlanGenerator.DemoDataPlan plan = DemoDataPlanGenerator.generate(
                pistas,
                LocalDate.now(),
                42L,
                encodedPassword
        );

        if (plan.usuarios().isEmpty() || plan.reservas().isEmpty()) {
            log.warn("[DemoDataSeeder] El generador produjo un plan vacío (¿hay pistas activas?). Se omite la siembra.");
            return;
        }

        // 3. Persistir usuarios
        log.info("[DemoDataSeeder] Insertando {} usuarios de demostración...", plan.usuarios().size());
        usuarioRepository.saveAll(plan.usuarios());

        // 4. Persistir reservas (las franjas se persisten automáticamente por cascade = ALL)
        log.info("[DemoDataSeeder] Insertando {} reservas de demostración con franjas atómicas...", plan.reservas().size());
        reservaRepository.saveAll(plan.reservas());

        // 5. Persistir pagos para la simulación (Spec 044)
        log.info("[DemoDataSeeder] Insertando pagos simulados para las reservas...");
        List<Pago> pagos = new ArrayList<>();
        Random rng = new Random(42L); // Misma semilla
        
        for (Reserva reserva : plan.reservas()) {
            BigDecimal coste = reserva.getCosteEstimado();
            if (coste == null) coste = BigDecimal.ZERO;

            MetodoPago metodo = rng.nextBoolean() ? MetodoPago.TARJETA_SIMULADA : MetodoPago.BIZUM_SIMULADO;
            LocalDateTime fechaPago = LocalDateTime.of(reserva.getFechaReserva(), reserva.getHoraInicio())
                    .minusMinutes(30L + rng.nextInt(1410));

            // Toda reserva tuvo un cobro inicial
            Pago cobro = Pago.builder()
                    .reserva(reserva)
                    .usuario(reserva.getUsuario())
                    .tipo(TipoPago.COBRO)
                    .metodo(metodo)
                    .importe(coste)
                    .fechaPago(fechaPago)
                    .concepto("Seed · " + reserva.getCodigoReserva())
                    .build();
            pagos.add(cobro);

            // Si está cancelada, simular posible reembolso
            if (reserva.getEstado() == EstadoReserva.CANCELADA) {
                int prob = rng.nextInt(100);
                BigDecimal reembolso = BigDecimal.ZERO;
                if (prob < 60) reembolso = coste; // 60% completo
                else if (prob < 85) reembolso = coste.multiply(new BigDecimal("0.50")); // 25% mitad
                
                if (reembolso.compareTo(BigDecimal.ZERO) > 0) {
                    Pago pagoReembolso = Pago.builder()
                            .reserva(reserva)
                            .usuario(reserva.getUsuario())
                            .tipo(TipoPago.REEMBOLSO)
                            .metodo(metodo)
                            .importe(reembolso)
                            .fechaPago(reserva.getFechaCancelacion() != null ? reserva.getFechaCancelacion() : LocalDateTime.now())
                            .concepto("Reembolso simulado " + reserva.getCodigoReserva())
                            .build();
                    pagos.add(pagoReembolso);
                }
            }
        }
        pagoRepository.saveAll(pagos);

        log.info("[DemoDataSeeder] Siembra completada con éxito: {} usuarios, {} reservas y {} pagos insertados.",
                plan.usuarios().size(), plan.reservas().size(), pagos.size());
    }
}
