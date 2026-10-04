# Prompt de implementación — spec 004

Implementa specs/004-preseleccion-pista-navegacion siguiendo spec.md, plan.md
y tasks.md (T01-T03). Contexto: el proyecto sigue la constitución en
.specify/memory/constitution.md — cambios mínimos, sin dependencias nuevas.

1. En padel-frontend/src/pages/PistasPage.tsx, localiza los dos botones
   "Reservar" (uno en la vista tarjeta para móvil, otro en la vista tabla
   para escritorio) que llaman a
   `navigate(isAuthenticated ? "/reservas" : "/login")`. Cámbialos por:
   `navigate(isAuthenticated ? "/reservas" : "/login", isAuthenticated ? { state: { pistaId: pista.id } } : undefined)`

2. En padel-frontend/src/pages/ReservasPage.tsx:
   - Añade `useLocation` al import existente de "react-router-dom".
   - Añade `const location = useLocation();` al inicio del componente.
   - Cambia `const [pistaSeleccionada, setPistaSeleccionada] = useState<number | null>(null);`
     para que inicialice leyendo el estado de navegación:
     `useState<number | null>(() => (location.state as { pistaId?: number } | null)?.pistaId ?? null)`

3. No toques el backend, no toques ningún otro archivo, no añadas dependencias.

Verificación: clic en "Reservar" desde una pista concreta debe abrir /reservas
con esa pista ya filtrada en el selector móvil (pistaSeleccionada). Navegar
directo a /reservas sin venir de Pistas debe mostrar todas las pistas.