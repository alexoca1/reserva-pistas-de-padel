# Prompt de implementación — spec 027

Implementa specs/027-limpieza-refresh-tokens siguiendo spec.md y
tasks.md (T01-T05). Cambios mínimos — solo backend, dos archivos
de código más la anotación de scheduling.

Lee antes de empezar: `RefreshTokenRepository.java`,
`RefreshTokenService.java`, `PadelReservasApplication.java`.

---

## T01 — RefreshTokenRepository.java

Añade este método al repositorio existente (Spring Data lo
implementa automáticamente por el nombre del método — sin
`@Query` necesario):

```java
@Modifying
@Transactional
void deleteAllByExpiryDateBefore(Instant ahora);
```

Añade los imports necesarios:
```java
import java.time.Instant;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
```

## T02 — RefreshTokenService.java

Añade este método al servicio existente:

```java
@Scheduled(cron = "0 0 3 * * *")
@Transactional
public void limpiarExpirados() {
    refreshTokenRepository.deleteAllByExpiryDateBefore(Instant.now());
}
```

Añade el import:
```java
import org.springframework.scheduling.annotation.Scheduled;
```

No toques ningún método existente del servicio.

## T03 — Habilitar @EnableScheduling

Localiza `PadelReservasApplication.java`. Añade la anotación a
nivel de clase:

```diff
+import org.springframework.scheduling.annotation.EnableScheduling;

+@EnableScheduling
 @SpringBootApplication
 public class PadelReservasApplication {
```

Si `@EnableScheduling` ya está en alguna clase `@Configuration`
del proyecto, sáltate este paso — no se puede declarar dos veces.

## T04 — Test

Crea `RefreshTokenServiceTest.java` (o añade al existente si ya
hay tests de este servicio):

```java
package com.padel.reservas.services;

import com.padel.reservas.repositories.RefreshTokenRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class RefreshTokenCleanupTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @InjectMocks
    private RefreshTokenService refreshTokenService;

    @Test
    void limpiarExpirados_llamaAlRepositorioConInstanteActual() {
        Instant antes = Instant.now();
        refreshTokenService.limpiarExpirados();
        Instant despues = Instant.now();

        ArgumentCaptor<Instant> captor = ArgumentCaptor.forClass(Instant.class);
        verify(refreshTokenRepository)
            .deleteAllByExpiryDateBefore(captor.capture());

        Instant instanteUsado = captor.getValue();
        // El instante pasado al repositorio debe estar entre
        // antes y después de la llamada
        assertFalse(instanteUsado.isBefore(antes));
        assertFalse(instanteUsado.isAfter(despues));
    }
}
```

## T05 — Verificación

Al arrancar la app, los logs de Spring deben mostrar algo similar a:

```
INFO  o.s.s.c.ThreadPoolTaskScheduler - Initializing ExecutorService 'taskScheduler'
```

Sin ese log, `@EnableScheduling` no está activo.

Para verificar la limpieza sin esperar a las 3:00, añade
temporalmente `@Scheduled(initialDelay = 5000, fixedDelay =
Long.MAX_VALUE)` al método (5 segundos tras arrancar, una sola
vez), comprueba los logs, y luego restaura el cron original.

No añadas dependencias nuevas — `spring-context` ya incluye el
soporte de scheduling en Spring Boot.