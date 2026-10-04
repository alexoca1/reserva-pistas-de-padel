# Tareas: Edición de datos personales

## Backend
- [x] T01 - Crear `UpdatePerfilDTO`
- [x] T02 - `AuthController`: método privado `isAdmin`
- [x] T03 - `AuthController`: endpoint `PUT /auth/perfil`
- [x] T04 - Test: usuario edita sus propios datos (sin `usuarioId`)
- [x] T05 - Test: admin edita `usuarioId` de otro usuario
- [x] T06 - Test: usuario no-admin envía `usuarioId` → se ignora, edita solo lo propio
- [x] T07 - Test: `usuarioId` inexistente → 400

## Frontend
- [x] T08 - `types/index.ts`: añadir `PerfilPayload`
- [x] T09 - `services/api.ts`: añadir `perfilService.actualizar`
- [x] T10 - `context/AuthContext.tsx`: añadir `actualizarUsuario`
- [x] T11 - Crear `pages/PerfilPage.tsx` (sección propia + sección admin)
- [x] T12 - `App.tsx`: ruta `/perfil` protegida
- [x] T13 - `components/Layout.tsx`: añadir `/perfil` a `TITULOS_POR_RUTA`
- [x] T14 - `components/Navbar.tsx`: enlace "Perfil" (escritorio + móvil)
- [x] T15 - Verificación manual y automatizada