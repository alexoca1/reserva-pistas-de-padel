package com.padel.reservas.seed;

import com.padel.reservas.entities.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Generador puro en memoria (POJO) para el plan de datos de demostración.
 * No depende de Spring ni de la base de datos, lo que permite pruebas unitarias
 * instantáneas de determinismo, ausencia de solapamientos y distribución.
 */
public class DemoDataPlanGenerator {

    public record DemoDataPlan(
            List<Usuario> usuarios,
            List<Reserva> reservas
    ) {}

    private static final String DOMAIN_SEED = "@seed.invalid";
    private static final String DEFAULT_PASSWORD_HASH = "$2a$10$w85YF481k2mN5qP6hS6kGuM3PjR1J9vR0bU9kLmNoPqRsTuVwXyZa"; // BCrypt dummy

    private static final String[] NOMBRES = {
            "Carlos", "Lucía", "Alejandro", "María", "David", "Paula", "Javier", "Elena",
            "Daniel", "Sara", "Manuel", "Carmen", "Pablo", "Laura", "Álvaro", "Cristina",
            "Sergio", "Marta", "Adrián", "Ana", "Hugo", "Raquel", "Jorge", "Beatriz",
            "Marcos", "Irene", "Rubén", "Silvia", "Iván", "Patricia", "Gonzalo", "Natalia",
            "Mario", "Claudio", "Clara", "Guillermo", "Teresa", "Héctor", "Rocío", "Víctor",
            "Nuria", "Fernando", "Alicia", "Diego", "Miriam"
    };

    private static final String[] APELLIDOS = {
            "García", "Martínez", "López", "González", "Rodríguez", "Fernández", "Sánchez",
            "Pérez", "Gómez", "Martín", "Jiménez", "Ruiz", "Hernández", "Díaz", "Moreno",
            "Muñoz", "Álvarez", "Romero", "Alonso", "Gutiérrez", "Navarro", "Torres",
            "Domínguez", "Vázquez", "Ramos", "Gil", "Ramírez", "Serrano", "Blanco", "Molina"
    };

    // Horas de inicio posibles entre 08:00 y 21:00
    private static final LocalTime[] HORAS_PICO = {
            LocalTime.of(18, 0), LocalTime.of(18, 30),
            LocalTime.of(19, 0), LocalTime.of(19, 30),
            LocalTime.of(20, 0), LocalTime.of(20, 30),
            LocalTime.of(21, 0)
    };

    private static final LocalTime[] HORAS_VALLE_TARDE = {
            LocalTime.of(16, 0), LocalTime.of(16, 30),
            LocalTime.of(17, 0), LocalTime.of(17, 30)
    };

    private static final LocalTime[] HORAS_VALLE_MANANA = {
            LocalTime.of(8, 0), LocalTime.of(8, 30),
            LocalTime.of(9, 0), LocalTime.of(9, 30),
            LocalTime.of(10, 0), LocalTime.of(10, 30),
            LocalTime.of(11, 0), LocalTime.of(11, 30),
            LocalTime.of(12, 0), LocalTime.of(12, 30),
            LocalTime.of(13, 0), LocalTime.of(13, 30)
    };

    private static final int[] DURACIONES = {90, 60, 120}; // Predominio 90

    public static DemoDataPlan generate(List<Pista> pistas, LocalDate fechaReferencia) {
        return generate(pistas, fechaReferencia, 42L, DEFAULT_PASSWORD_HASH);
    }

    public static DemoDataPlan generate(List<Pista> pistas, LocalDate fechaReferencia, long seed, String passwordHash) {
        Random rng = new Random(seed);

        // 1. Filtrar pistas activas
        List<Pista> pistasActivas = pistas.stream()
                .filter(p -> p.getEstado() == EstadoPista.ACTIVA)
                .toList();

        if (pistasActivas.isEmpty()) {
            return new DemoDataPlan(Collections.emptyList(), Collections.emptyList());
        }

        // 2. Generar usuarios (entre 40 y 45)
        int numUsuarios = 40 + rng.nextInt(6);
        List<Usuario> usuarios = new ArrayList<>(numUsuarios);
        for (int i = 1; i <= numUsuarios; i++) {
            String nombre = NOMBRES[(i - 1) % NOMBRES.length];
            String apellido = APELLIDOS[(i * 3) % APELLIDOS.length];
            String email = String.format("usuario%03d%s", i, DOMAIN_SEED);
            String telefono = String.format("6%08d", 10000000 + rng.nextInt(89999999));

            Usuario u = Usuario.builder()
                    .nombre(nombre)
                    .apellidos(apellido)
                    .email(email)
                    .password(passwordHash)
                    .telefono(telefono)
                    .roles("ROLE_USER")
                    .enabled(true)
                    .fechaRegistro(fechaReferencia.minusDays(100 + rng.nextInt(30)).atTime(10, 0))
                    .build();
            usuarios.add(u);
        }

        // 3. Estructuras en memoria para garantizar NO solapamientos
        // Slot ocupado: pistaId + "#" + fecha + "#" + slotTime (slots de 30 min)
        Set<String> slotsOcupados = new HashSet<>();

        // Minutos reservados por usuario por fecha: email + "#" + fecha -> list of [startMin, endMin]
        Map<String, List<int[]>> usuarioDiaOcupacion = new HashMap<>();

        List<Reserva> reservas = new ArrayList<>();
        int codigoCounter = 1;

        // Ventana: de 75 días al pasado a 7 días al futuro (~83 días)
        LocalDate fechaInicio = fechaReferencia.minusDays(75);
        LocalDate fechaFin = fechaReferencia.plusDays(7);

        for (LocalDate fecha = fechaInicio; !fecha.isAfter(fechaFin); fecha = fecha.plusDays(1)) {
            boolean esFinDeSemana = fecha.getDayOfWeek() == DayOfWeek.SATURDAY || fecha.getDayOfWeek() == DayOfWeek.SUNDAY;

            // Cantidad de reservas deseadas para este día según el número de pistas activas
            // Entre 3 y 4 reservas por pista en laborable, entre 4 y 5 en fin de semana
            int reservasObjetivoPorPista = esFinDeSemana ? (3 + rng.nextInt(3)) : (2 + rng.nextInt(3));
            int totalIntentos = pistasActivas.size() * reservasObjetivoPorPista * 3;

            for (int intento = 0; intento < totalIntentos; intento++) {
                Pista pista = pistasActivas.get(rng.nextInt(pistasActivas.size()));
                Usuario usuario = usuarios.get(rng.nextInt(usuarios.size()));

                // Determinar duración: 70% 90min, 20% 60min, 10% 120min
                int probDur = rng.nextInt(100);
                int duracion = (probDur < 70) ? 90 : (probDur < 90 ? 60 : 120);

                // Determinar hora de inicio según demanda
                LocalTime horaInicio = seleccionarHoraInicio(rng, esFinDeSemana);
                LocalTime horaFin = horaInicio.plusMinutes(duracion);

                // La hora de fin no puede superar 23:00
                if (horaFin.isAfter(LocalTime.of(23, 0))) {
                    continue;
                }

                // Validar solapamiento en la pista
                if (solapaPista(slotsOcupados, pista.getId(), fecha, horaInicio, horaFin)) {
                    continue;
                }

                // Validar límites de usuario (sin solapamiento horario y máx 120 min/día)
                if (solapaUsuario(usuarioDiaOcupacion, usuario.getEmail(), fecha, horaInicio, horaFin, duracion)) {
                    continue;
                }

                // Determinar si la reserva es cancelada (~7%)
                boolean esCancelada = rng.nextInt(100) < 7;

                if (!esCancelada) {
                    // Reservar franjas atómicas en memoria
                    registrarSlotsPista(slotsOcupados, pista.getId(), fecha, horaInicio, horaFin);
                    registrarOcupacionUsuario(usuarioDiaOcupacion, usuario.getEmail(), fecha, horaInicio, horaFin);
                }

                // Crear entidad Reserva
                Reserva reserva = new Reserva();
                reserva.setPista(pista);
                reserva.setUsuario(usuario);
                reserva.setFechaReserva(fecha);
                reserva.setHoraInicio(horaInicio);
                reserva.setHoraFin(horaFin);
                reserva.setNombreJugador(usuario.getNombre() + " " + usuario.getApellidos());
                reserva.setTelefono(usuario.getTelefono());

                String codigo = String.format("RES-%s-%04d",
                        fecha.format(DateTimeFormatter.ofPattern("yyyyMMdd")),
                        codigoCounter++);
                reserva.setCodigoReserva(codigo);

                if (esCancelada) {
                    reserva.setEstado(EstadoReserva.CANCELADA);
                    LocalDateTime fechaCanc;
                    if (fecha.isBefore(fechaReferencia)) {
                        fechaCanc = fecha.minusDays(1).atTime(LocalTime.of(12, 0));
                    } else {
                        fechaCanc = fechaReferencia.minusDays(1).atTime(LocalTime.of(10, 0));
                    }
                    reserva.setFechaCancelacion(fechaCanc);
                } else {
                    reserva.setEstado(EstadoReserva.CONFIRMADA);
                    // Crear entidades FranjaReservada asociadas
                    List<FranjaReservada> franjas = new ArrayList<>();
                    for (LocalTime slot = horaInicio; slot.isBefore(horaFin); slot = slot.plusMinutes(30)) {
                        FranjaReservada fr = new FranjaReservada();
                        fr.setPista(pista);
                        fr.setFecha(fecha);
                        fr.setHoraSlot(slot);
                        fr.setReserva(reserva);
                        franjas.add(fr);
                    }
                    reserva.setFranjas(franjas);
                }

                reservas.add(reserva);
            }
        }

        return new DemoDataPlan(usuarios, reservas);
    }

    private static LocalTime seleccionarHoraInicio(Random rng, boolean esFinDeSemana) {
        int prob = rng.nextInt(100);
        if (esFinDeSemana) {
            // Fin de semana: 45% mañanas, 45% tardes pico, 10% valle tarde
            if (prob < 45) {
                return HORAS_VALLE_MANANA[rng.nextInt(HORAS_VALLE_MANANA.length)];
            } else if (prob < 90) {
                return HORAS_PICO[rng.nextInt(HORAS_PICO.length)];
            } else {
                return HORAS_VALLE_TARDE[rng.nextInt(HORAS_VALLE_TARDE.length)];
            }
        } else {
            // Laborable: 65% horas pico (18:00 - 21:00), 20% valle tarde, 15% mañanas
            if (prob < 65) {
                return HORAS_PICO[rng.nextInt(HORAS_PICO.length)];
            } else if (prob < 85) {
                return HORAS_VALLE_TARDE[rng.nextInt(HORAS_VALLE_TARDE.length)];
            } else {
                return HORAS_VALLE_MANANA[rng.nextInt(HORAS_VALLE_MANANA.length)];
            }
        }
    }

    private static boolean solapaPista(Set<String> slotsOcupados, Long pistaId, LocalDate fecha, LocalTime inicio, LocalTime fin) {
        for (LocalTime slot = inicio; slot.isBefore(fin); slot = slot.plusMinutes(30)) {
            String key = slotKey(pistaId, fecha, slot);
            if (slotsOcupados.contains(key)) {
                return true;
            }
        }
        return false;
    }

    private static void registrarSlotsPista(Set<String> slotsOcupados, Long pistaId, LocalDate fecha, LocalTime inicio, LocalTime fin) {
        for (LocalTime slot = inicio; slot.isBefore(fin); slot = slot.plusMinutes(30)) {
            slotsOcupados.add(slotKey(pistaId, fecha, slot));
        }
    }

    private static String slotKey(Long pistaId, LocalDate fecha, LocalTime slot) {
        return pistaId + "#" + fecha + "#" + slot.toString();
    }

    private static boolean solapaUsuario(Map<String, List<int[]>> ocupacion, String email, LocalDate fecha, LocalTime inicio, LocalTime fin, int duracion) {
        String key = email + "#" + fecha;
        List<int[]> rangos = ocupacion.getOrDefault(key, Collections.emptyList());

        int startMin = inicio.getHour() * 60 + inicio.getMinute();
        int endMin = fin.getHour() * 60 + fin.getMinute();

        int minutosTotales = 0;
        for (int[] r : rangos) {
            // Solapamiento en el mismo horario
            if (startMin < r[1] && endMin > r[0]) {
                return true;
            }
            minutosTotales += (r[1] - r[0]);
        }

        // Máximo 120 minutos por usuario y día
        return (minutosTotales + duracion) > 120;
    }

    private static void registrarOcupacionUsuario(Map<String, List<int[]>> ocupacion, String email, LocalDate fecha, LocalTime inicio, LocalTime fin) {
        String key = email + "#" + fecha;
        int startMin = inicio.getHour() * 60 + inicio.getMinute();
        int endMin = fin.getHour() * 60 + fin.getMinute();

        ocupacion.computeIfAbsent(key, k -> new ArrayList<>()).add(new int[]{startMin, endMin});
    }
}
