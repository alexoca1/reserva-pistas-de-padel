# Plan técnico: ConfiguracionClub

**Spec relacionada:** ./spec.md

## Diseño

### Backend

**`ConfiguracionClub`** (entidad JPA): un solo campo `id` fijo a `1L`
(`@Id` sin `@GeneratedValue`, el registro es singleton por diseño).
Campos `LocalTime` para apertura/cierre, `int` para los demás. El campo
`duracionesPermitidas` se almacena como `String` en DB
(`"60,90,120"`) y se convierte a `Set<Integer>` con un getter calculado
— sin `@Converter` ni tipo JSON, solo `Arrays.stream(valor.split(","))`.

**`ConfiguracionClubRepository`**: extiende `JpaRepository<ConfiguracionClub, Long>`.
Añade un método estático de conveniencia en el mismo Service:
`getConfiguracion()` que llama a `findById(1L).orElseThrow()` — el
registro siempre existe porque `DataInitializer` lo garantiza al arrancar.

**`ConfiguracionClubService`**: `getConfiguracion()` y `actualizar(dto)`.
Sin interfaz (Artículo 1).

**`AdminController`** (nuevo): `GET /admin/configuracion` y
`PUT /admin/configuracion`, ambos con `@PreAuthorize("hasRole('ADMIN')")`.
Patrón idéntico a los métodos de admin ya existentes en
`PistasController`/`AuthController`.

**`DataInitializer`**: añade inicialización de `ConfiguracionClub` con
valores por defecto si `count() == 0` — mismo patrón que ya usa para
el admin semilla.

**`ReservaService`**: sustituye las constantes hardcodeadas
(`DURACIONES_VALIDAS`, `MAXIMO_MINUTOS_DIA`, `CIERRE`) por llamadas a
`configuracionClubService.getConfiguracion()`. Inyecta
`ConfiguracionClubService` por constructor.

**Nuevo endpoint de lectura pública** (opcional pero útil):
`GET /configuracion/duraciones` — devuelve solo las duraciones permitidas
y la duración por defecto, sin autenticación, para que el formulario de
reserva las muestre sin necesitar rol admin.

### Frontend

**`services/api.ts`**: añade `configuracionService.getDuraciones()` →
`GET /configuracion/duraciones`.

**`ReservasPage.tsx`**: carga las duraciones permitidas al montar (un
`useEffect` simple), las usa para generar las opciones del selector de
duración. Mientras carga, muestra las tres opciones hardcodeadas como
fallback — sin bloquear la UI.

## Decisiones y alternativas descartadas

- **JSON en DB para `duracionesPermitidas`**: descartado — requiere
  `@Column(columnDefinition="json")` específico de MySQL y un
  `@Converter`; `"60,90,120"` como string con split es suficiente para
  un máximo de 3-4 valores.
- **Caché con `@Cacheable`**: descartado por ahora — el admin cambia la
  configuración raramente, pero cada reserva lee la config; con el volumen
  de un club real (pocas reservas/minuto) una query simple es suficiente.
  `ponytail:` si hay evidencia de contención, añadir `@Cacheable` en
  `getConfiguracion()` e invalidar en `actualizar()`.
- **Configuración por pista**: fuera de scope explícito.

## Impacto en seguridad
`PUT /admin/configuracion` requiere `ROLE_ADMIN` — mismo patrón que el
resto de endpoints de admin. `GET /configuracion/duraciones` es público
(solo devuelve duraciones, sin datos sensibles).