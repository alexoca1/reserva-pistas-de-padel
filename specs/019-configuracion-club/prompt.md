# Prompt de implementación — spec 019

Implementa specs/019-configuracion-club siguiendo spec.md, plan.md y
tasks.md (T01-T14). Sigue .specify/memory/constitution.md — cambios
mínimos, sin dependencias nuevas, reutiliza patrones existentes.

Lee antes de empezar: `DataInitializer.java` (patrón de inicialización
de datos), `AuthController.java` (patrón de endpoints con
`@PreAuthorize`), `ReservaService.java` (constantes a sustituir).

---

## T01 — Crear ConfiguracionClub.java

```java
package com.padel.reservas.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "configuracion_club")
@Getter
@Setter
public class ConfiguracionClub {

    // ponytail: id fijo = 1L, registro singleton — no usar
    // @GeneratedValue, la tabla siempre tiene exactamente una fila.
    @Id
    private Long id = 1L;

    @Column(nullable = false)
    private Integer duracionMinimaMinutos = 60;

    // Almacenado como "60,90,120" — parsear con getDuracionesPermitidas()
    @Column(nullable = false)
    private String duracionesPermitidasMinutos = "60,90,120";

    @Column(nullable = false)
    private Integer duracionPorDefectoMinutos = 90;

    @Column(nullable = false)
    private Integer maximoMinutosPorDia = 120;

    @Column(nullable = false)
    private LocalTime horaApertura = LocalTime.of(9, 0);

    @Column(nullable = false)
    private LocalTime horaCierre = LocalTime.of(23, 0);

    @Column(nullable = false)
    private Integer diasAntelacionMaxima = 7;

    @Transient
    public Set<Integer> getDuracionesPermitidas() {
        return Arrays.stream(duracionesPermitidasMinutos.split(","))
            .map(String::trim)
            .map(Integer::parseInt)
            .collect(Collectors.toSet());
    }
}
```

## T02 — Crear ConfiguracionClubRepository.java

```java
package com.padel.reservas.repositories;

import com.padel.reservas.entities.ConfiguracionClub;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConfiguracionClubRepository
        extends JpaRepository<ConfiguracionClub, Long> {
}
```

## T03 — Crear ConfiguracionClubService.java

```java
package com.padel.reservas.services;

import com.padel.reservas.dto.UpdateConfiguracionDTO;
import com.padel.reservas.entities.ConfiguracionClub;
import com.padel.reservas.repositories.ConfiguracionClubRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ConfiguracionClubService {

    private final ConfiguracionClubRepository repo;

    public ConfiguracionClub getConfiguracion() {
        return repo.findById(1L)
            .orElseThrow(() -> new IllegalStateException(
                "ConfiguracionClub no inicializada — revisar DataInitializer"));
    }

    @Transactional
    public ConfiguracionClub actualizar(UpdateConfiguracionDTO dto) {
        ConfiguracionClub config = getConfiguracion();
        if (dto.duracionMinimaMinutos() != null)
            config.setDuracionMinimaMinutos(dto.duracionMinimaMinutos());
        if (dto.duracionesPermitidasMinutos() != null)
            config.setDuracionesPermitidasMinutos(dto.duracionesPermitidasMinutos());
        if (dto.duracionPorDefectoMinutos() != null)
            config.setDuracionPorDefectoMinutos(dto.duracionPorDefectoMinutos());
        if (dto.maximoMinutosPorDia() != null)
            config.setMaximoMinutosPorDia(dto.maximoMinutosPorDia());
        if (dto.horaApertura() != null)
            config.setHoraApertura(dto.horaApertura());
        if (dto.horaCierre() != null)
            config.setHoraCierre(dto.horaCierre());
        if (dto.diasAntelacionMaxima() != null)
            config.setDiasAntelacionMaxima(dto.diasAntelacionMaxima());
        return repo.save(config);
    }
}
```

## T03b — Crear UpdateConfiguracionDTO.java

```java
package com.padel.reservas.dto;

import java.time.LocalTime;

public record UpdateConfiguracionDTO(
    Integer duracionMinimaMinutos,
    String duracionesPermitidasMinutos,
    Integer duracionPorDefectoMinutos,
    Integer maximoMinutosPorDia,
    LocalTime horaApertura,
    LocalTime horaCierre,
    Integer diasAntelacionMaxima
) {}
```

Todos los campos son opcionales (nullable) — el servicio solo actualiza
los que vienen informados.

## T04-T05 — Crear AdminController.java

```java
package com.padel.reservas.controller;

import com.padel.reservas.dto.UpdateConfiguracionDTO;
import com.padel.reservas.entities.ConfiguracionClub;
import com.padel.reservas.services.ConfiguracionClubService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AdminController {

    private final ConfiguracionClubService configuracionService;

    @GetMapping("/admin/configuracion")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConfiguracionClub> getConfiguracion() {
        return ResponseEntity.ok(configuracionService.getConfiguracion());
    }

    @PutMapping("/admin/configuracion")
    @PreAuthorize("hasRole('ADMIN')")
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
```

Añade `/configuracion/duraciones` a `permitAll()` en `SecurityConfig`,
junto a los otros endpoints públicos ya existentes.

## T06 — DataInitializer.java

Localiza el método que inicializa el admin semilla y añade justo después,
con el mismo patrón de "solo si no existe":

```java
if (configuracionClubRepository.count() == 0) {
    configuracionClubRepository.save(new ConfiguracionClub());
}
```

Inyecta `ConfiguracionClubRepository` por constructor
(`@RequiredArgsConstructor` ya está en `DataInitializer`).

## T07 — ReservaService.java

Inyecta `ConfiguracionClubService` por constructor (añádelo al campo
`private final` — `@RequiredArgsConstructor` hace el resto).

Sustituye las tres constantes hardcodeadas:

```java
// Antes:
private static final Set<Integer> DURACIONES_VALIDAS = Set.of(60, 90, 120);
private static final int MAXIMO_MINUTOS_DIA = 120;
private static final LocalTime CIERRE = LocalTime.of(23, 0);

// Después: elimina las tres constantes. En cada método que las usaba,
// lee la config al inicio:
ConfiguracionClub config = configuracionClubService.getConfiguracion();
// y usa config.getDuracionesPermitidas(), config.getMaximoMinutosPorDia(),
// config.getHoraCierre() donde antes estaban las constantes.
```

## T08-T09 — Tests

Añade en `ReservaServiceTest.java` (misma clase ya creada en spec 017):

```java
@Mock private ConfiguracionClubService configuracionClubService;

// En setUp(), añade:
ConfiguracionClub config = new ConfiguracionClub(); // valores por defecto
when(configuracionClubService.getConfiguracion()).thenReturn(config);
// Actualiza el constructor de ReservaService si ahora recibe dos parámetros:
service = new ReservaService(reservaRepository, configuracionClubService);

@Test
void crear_duracionNoEnConfiguracion_lanzaError() {
    ConfiguracionClub configRestrictiva = new ConfiguracionClub();
    configRestrictiva.setDuracionesPermitidasMinutos("60"); // solo 60 min
    when(configuracionClubService.getConfiguracion())
        .thenReturn(configRestrictiva);
    // 90 min ya no está permitido
    assertThrows(IllegalArgumentException.class,
        () -> service.crear(dto("10:00", "11:30"), pista, usuario));
}

@Test
void crear_fueraDeCierre_segunConfiguracion_lanzaError() {
    ConfiguracionClub configTemprana = new ConfiguracionClub();
    configTemprana.setHoraCierre(LocalTime.of(22, 0));
    when(configuracionClubService.getConfiguracion())
        .thenReturn(configTemprana);
    // 21:30 + 60 min = 22:30 > 22:00
    assertThrows(IllegalArgumentException.class,
        () -> service.crear(dto("21:30", "22:30"), pista, usuario));
}
```

## T10-T12 — Frontend

### api.ts
Añade junto a los demás servicios:

```ts
export const configuracionService = {
  getDuraciones: () =>
    fetchAPI<{ duracionesPermitidas: number[]; duracionPorDefecto: number }>(
      "/configuracion/duraciones"
    ),
};
```

### types/index.ts
```ts
export interface ConfiguracionDuraciones {
  duracionesPermitidas: number[];
  duracionPorDefecto: number;
}
```

### ReservasPage.tsx (descrito)
Añade estado `duraciones` inicializado con el fallback
`{ duracionesPermitidas: [60, 90, 120], duracionPorDefecto: 90 }`.
Un `useEffect` con array de dependencias vacío llama a
`configuracionService.getDuraciones()` al montar y actualiza el estado
si tiene éxito — si falla, el fallback ya cargado sigue funcionando.
El selector de duración genera sus `<option>` a partir de
`duraciones.duracionesPermitidas`, marcando como `selected` la que
coincida con `duraciones.duracionPorDefecto`.

## T13 — padel-backend/AGENTS.md (descrito)

En la estructura de paquetes, añade:
- `ConfiguracionClub.java` en `entities/`
- `ConfiguracionClubRepository.java` en `repositories/`
- `ConfiguracionClubService.java` en `services/`
- `AdminController.java` en `controller/`
- `UpdateConfiguracionDTO.java` en `dto/`

En las tablas de endpoints, añade una sección nueva:

```
### 4) Configuración del club

| GET  | /configuracion/duraciones  | No  | No   | Duraciones permitidas y por defecto |
| GET  | /admin/configuracion       | Sí  | Sí   | Configuración completa del club     |
| PUT  | /admin/configuracion       | Sí  | Sí   | Actualiza configuración del club    |
```

No toques SecurityConfig más allá de añadir `/configuracion/duraciones`
a `permitAll()`. No añadas dependencias nuevas.