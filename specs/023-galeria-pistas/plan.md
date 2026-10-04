# Plan técnico: Galería de fotos por pista

**Spec relacionada:** ./spec.md

## Diseño

### Backend

**`FotoPista`** (entidad JPA):
```java
@Entity
@Table(name = "fotos_pista")
public class FotoPista {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pista_id", nullable = false)
    private Pista pista;

    @Column(nullable = false)
    private String url;

    @Column(name = "public_id", nullable = false)
    private String publicId; // para llamar a CloudinaryService.eliminar

    @Column(name = "es_portada", nullable = false)
    private boolean esPortada = false;

    @Column(nullable = false)
    private Integer orden = 0;
}
```

**`Pista`**: añadir `@OneToMany(mappedBy = "pista", cascade =
CascadeType.ALL, orphanRemoval = true)` hacia `FotoPista`. El campo
`imagenUrl` se mantiene y se sincroniza automáticamente cuando cambia
la portada.

**`FotoPistaRepository`**: `findByPistaIdOrderByOrden`,
`countByPistaId`.

**`FotoPistaController`** (o nuevos métodos en `PistasController` — ver
decisiones):
- `GET /pistas/{id}/fotos` — público, devuelve lista de `FotoPistaDTO`
  (url, id, esPortada, orden).
- `POST /pistas/{id}/fotos` — ADMIN: valida máximo 5, llama a
  `uploadService.subir`, persiste `FotoPista`, si es la primera foto
  la marca como portada automáticamente y sincroniza `imagenUrl`.
- `DELETE /pistas/{id}/fotos/{fotoId}` — ADMIN: llama a
  `CloudinaryService.eliminar(publicId)`, borra la fila; si era portada,
  promueve la siguiente foto como portada y sincroniza `imagenUrl`.
- `PUT /pistas/{id}/fotos/{fotoId}/portada` — ADMIN: quita el flag de
  portada de todas las fotos de esa pista, lo pone en `fotoId`,
  sincroniza `imagenUrl` en `Pista`.

**Borrado de pista** (`DELETE /pistas/{id}`): antes del borrado de la
entidad, iterar las fotos y llamar a `CloudinaryService.eliminar` para
cada `publicId`. El `cascade = ALL` + `orphanRemoval` borra las filas
de BD automáticamente; el borrado de Cloudinary hay que hacerlo
explícitamente antes, porque Cloudinary no conoce el ciclo de vida JPA.

### Frontend

**`LightboxGaleria.tsx`** (nuevo componente en `components/`):
- Props: `fotos: FotoPista[]`, `indiceInicial: number`, `onCerrar: () => void`.
- Overlay a pantalla completa con `position: fixed`, `z-index` mayor
  que el `Dialog` (que ya usa `z-50`).
- Navegación prev/next con botones y flechas de teclado.
- Escape cierra (mismo patrón que `Dialog`, spec 007).
- Devuelve foco al elemento que lo abrió al cerrarse (mismo patrón
  spec 007).
- Accesible: `role="dialog"`, `aria-modal="true"`, `aria-label="Galería
  de fotos"`.

**`PistasPage.tsx`**:
- Para todos los usuarios: clic en la miniatura de la pista carga las
  fotos de esa pista (`GET /pistas/{id}/fotos`) y abre `LightboxGaleria`.
  Si la pista no tiene fotos, el clic no hace nada (miniatura no
  interactiva).
- Para admin: sección de gestión de galería debajo de los datos de la
  pista en el formulario/diálogo de edición — botón "Subir foto",
  grid de miniaturas con botón "Eliminar" y botón "Establecer como
  portada" en cada una.

**`services/api.ts`**: añadir `fotoPistaService`:
- `getAll(pistaId)` → `GET /pistas/{id}/fotos`
- `subir(pistaId, file)` → llama a `uploadService.subir` primero, luego
  `POST /pistas/{id}/fotos` con la URL y publicId resultado.
- `eliminar(pistaId, fotoId)` → `DELETE /pistas/{id}/fotos/{fotoId}`
- `setPortada(pistaId, fotoId)` → `PUT /pistas/{id}/fotos/{fotoId}/portada`

## Decisiones y alternativas descartadas

- **Nuevos métodos en `PistasController` vs. `FotoPistaController`
  separado**: se elige `FotoPistaController` separado — `PistasController`
  ya gestiona CRUD de pistas; añadir 4 endpoints de galería lo haría
  demasiado largo. Artículo 2: borrado sobre adición aplica también al
  tamaño de los archivos.
- **Subir la imagen directamente a Cloudinary desde el frontend y luego
  guardar solo la URL en el backend**: descartado por RGPD — el backend
  debe ser el intermediario (ver spec 022, decisiones).
- **Reordenación por drag**: descartado — el orden se gestiona implícitamente
  por orden de subida; suficiente para una demo y sin dependencia nueva
  (no merece DnD library).
- **`imagenUrl` en `Pista` reemplazado completamente por `FotoPista`**:
  descartado — rompe código existente en `PistasPage`, `DashboardPage` y
  `CuadriculaDisponibilidad` que ya usa `imagenUrl`; sincronizarlo es
  un diff mucho más pequeño.

## Impacto en seguridad
`GET /pistas/{id}/fotos` es público (coherente con que `GET /pistas` ya
lo es). Los endpoints de escritura requieren `ROLE_ADMIN`. El borrado de
Cloudinary antes del borrado de BD garantiza que no quedan datos de
imagen huérfanos.