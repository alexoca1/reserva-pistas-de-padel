# Plan técnico: Galería de fotos de la sede

**Spec relacionada:** ./spec.md

## Diseño

### Backend

**`FotoSede`** (entidad JPA):
```java
@Entity
@Table(name = "fotos_sede")
public class FotoSede {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String url;

    @Column(name = "public_id", nullable = false)
    private String publicId;

    @Column(nullable = false)
    private Integer orden = 0;
}
```

**`FotoSedeRepository`**: `findAllByOrderByOrden()`,
`count()`.

**`SedeController`** (`@RestController`):
- `GET /sede/fotos` — público (`permitAll()` en `SecurityConfig`).
- `POST /sede/fotos` — `ROLE_ADMIN`: valida máximo 10, llama a
  `cloudinaryService.subir(file, "sede", 1920)`, persiste `FotoSede`.
- `DELETE /sede/fotos/{id}` — `ROLE_ADMIN`: llama a
  `cloudinaryService.eliminar(publicId)`, borra la fila.

**`SecurityConfig`**: añadir `/sede/fotos` a `permitAll()` junto a
`/pistas` y `/pistas/**`.

### Frontend

**`pages/InstalacionesPage.tsx`** (nueva página pública):
- Carga `GET /sede/fotos` al montar.
- Carga `GET /pistas` al montar (ya existe `pistasService.getAll()`).
- Grid de fotos de sede con `<img loading="lazy">` — sin lightbox.
- Sección inferior con las pistas en cards compactas (miniatura +
  nombre + iluminación).
- Botón CTA que navega a `/reservas` si `isAuthenticated`, a `/login`
  si no.
- Animaciones de entrada con `framer-motion` + `staggerContainer`/
  `fadeUp` — mismo patrón que el resto de páginas.

**`pages/AdminGaleriaPage.tsx`** (nueva página protegida):
- Carga `GET /sede/fotos` al montar.
- Grid de fotos actuales con botón "Eliminar" en cada una (diálogo de
  confirmación igual que en `PistasPage`/`DashboardPage`).
- Botón "Subir foto" que abre un `<input type="file" accept="image/*">`
  nativo, muestra preview con `URL.createObjectURL`, y al confirmar
  llama a `fotoSedeService.subir(file)`.
- Estado de carga, error inline, toast de éxito — patrones ya
  establecidos en specs 007 y 008.
- Deshabilitado al llegar a 10 fotos.

**`services/api.ts`**: añadir `fotoSedeService`:
```ts
export const fotoSedeService = {
  getAll: () => fetchAPI<FotoSede[]>("/sede/fotos"),
  subir: async (file: File) => {
    const { url, publicId } = await uploadService.subir(file);
    return fetchAPI<FotoSede>("/sede/fotos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, publicId }),
    });
  },
  eliminar: (id: number) =>
    fetchAPI(`/sede/fotos/${id}`, { method: "DELETE" }),
};
```

**`App.tsx`**: añadir rutas:
- `/instalaciones` — pública, dentro de `<Layout>`.
- `/admin/galeria` — dentro de `<ProtectedRoute>`, dentro de `<Layout>`.

**`Layout.tsx`**: añadir `/instalaciones` y `/admin/galeria` a
`TITULOS_POR_RUTA`.

**`Navbar.tsx`**: añadir "Instalaciones" en el bloque de enlaces
públicos (junto a "Pistas"); añadir "Galería" en el bloque autenticado
solo si `isAdmin`.

**`types/index.ts`**: añadir tipo `FotoSede { id: number; url: string;
publicId: string; orden: number }`.

## Decisiones y alternativas descartadas

- **Lightbox en `/instalaciones`**: descartado para esta spec —
  `LightboxGaleria` ya existe de spec 023 y podría reutilizarse, pero
  añadir ese comportamiento aquí amplía el scope sin aportar valor
  funcional distinto al grid. Queda como mejora futura.
- **Galería de sede dentro del Dashboard del admin** (Opción B que
  descartamos): descartada por decisión explícita tuya — `/admin/galeria`
  como página propia.
- **`SedeController` dentro de `PistasController`**: descartado —
  semánticamente son entidades distintas; un controlador por recurso
  es más limpio y más fácil de testear.
- **Grid de pistas en `/instalaciones` con el componente completo de
  `PistasPage`**: descartado — `PistasPage` tiene lógica de CRUD admin
  que no corresponde aquí; se usa solo la vista de cards compactas, sin
  reutilizar el componente completo.

## Impacto en seguridad
`GET /sede/fotos` público — coherente con que el contenido de marketing
del club es público. Los endpoints de escritura requieren `ROLE_ADMIN`.